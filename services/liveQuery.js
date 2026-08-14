/**
 * Live Query - real-time object subscriptions over an injected Socket.IO
 * client, backing `sdk.objects.liveQuery(...)`.
 *
 * *** KNOWN CONTRACT DEVIATION - BLOCKING, see plan Phase 3 ***
 * The locked contract signature is
 * `sdk.objects.liveQuery({ object, filter, fields, recordTypeId, onEvent, onStateChange })`
 * with NO socket param — the SDK is supposed to own its own socket
 * transport. That transport does not exist yet (base.js's `addTransport` is
 * HTTP-request-only; video.js never holds a socket either; nothing in this
 * repo ever sets `sdk.socket`), so THIS implementation requires the caller
 * to inject an authed socket.io-client instance via `sdk.objects.liveQuery({
 * socket, ... })` (or a future `sdk.socket`), and throws synchronously if
 * neither is present. Any caller following the locked contract literally
 * will fail. This must be resolved (build the socket transport per the plan,
 * or amend the locked contract) before Phase 4 app1-client integration
 * proceeds — do not build against `socket` as permanent public API.
 *
 * Contract (app1-object-stream / app1-socket, locked):
 * - emit 'objects.liveQuery.subscribe' { objectName, filter, fields,
 *   recordTypeId? } with an ack callback -> { subscriptionId, mode } | { error }
 * - one 30s heartbeat timer per socket, batching every live subscriptionId
 *   on that socket: emit 'objects.liveQuery.heartbeat' { subscriptionIds }
 * - server pushes 'objects.liveQuery.event' { subscriptionId, type, seq,
 *   recordId, record, changedFields, rowVersion }
 * - per-subscription seq gap -> synthetic { type: 'resync' } to onEvent
 * - socket 'connect' (i.e. reconnect) -> transparently re-subscribe every
 *   live handle (new subscriptionId internally, handle object unchanged)
 *   and emit { type: 'resync' }
 * - 'revoked' frames tear the handle down
 */

const HEARTBEAT_INTERVAL_MS = 30000;

// One manager per socket instance so the heartbeat timer is shared across
// every liveQuery() subscription on that socket, not created per-sub.
const socketManagers = new WeakMap();

function getSocketManager(socket) {
  let manager = socketManagers.get(socket);
  if (!manager) {
    manager = new SocketLiveQueryManager(socket);
    socketManagers.set(socket, manager);
  }
  return manager;
}

class SocketLiveQueryManager {
  constructor(socket) {
    this.socket = socket;
    this.handles = new Map(); // subscriptionId -> LiveQueryHandle
    this.heartbeatTimer = null;
    this._onConnect = this._onConnect.bind(this);
    this._onEvent = this._onEvent.bind(this);
    socket.on('connect', this._onConnect);
    socket.on('objects.liveQuery.event', this._onEvent);
  }

  register(handle) {
    this.handles.set(handle.subscriptionId, handle);
    this._ensureHeartbeat();
  }

  unregister(subscriptionId) {
    this.handles.delete(subscriptionId);
    this._stopHeartbeatIfIdle();
  }

  // Final teardown of a handle: unregister, and if this was the last live
  // handle on the socket, drop our socket-level listeners too.
  destroy(subscriptionId) {
    this.unregister(subscriptionId);
    if (this.handles.size === 0) {
      this.socket.off('connect', this._onConnect);
      this.socket.off('objects.liveQuery.event', this._onEvent);
      socketManagers.delete(this.socket);
    }
  }

  _ensureHeartbeat() {
    if (this.heartbeatTimer || this.handles.size === 0) return;
    this.heartbeatTimer = setInterval(() => {
      const subscriptionIds = Array.from(this.handles.keys());
      if (subscriptionIds.length === 0) return;
      this.socket.emit('objects.liveQuery.heartbeat', { subscriptionIds });
    }, HEARTBEAT_INTERVAL_MS);
    if (this.heartbeatTimer.unref) this.heartbeatTimer.unref();
  }

  _stopHeartbeatIfIdle() {
    if (this.handles.size === 0 && this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  _onEvent(frame) {
    const handle = frame && this.handles.get(frame.subscriptionId);
    if (!handle) return;
    handle._handleEvent(frame);
  }

  async _onConnect() {
    // Transparent re-subscribe of every live handle on this socket.
    const handles = Array.from(this.handles.values());
    for (const handle of handles) {
      await handle._resubscribe();
    }
  }
}

class LiveQueryHandle {
  constructor({
    manager,
    socket,
    object,
    filter,
    fields,
    recordTypeId,
    onEvent,
    onStateChange,
  }) {
    this.manager = manager;
    this.socket = socket;
    this.object = object;
    this.filter = filter;
    this.fields = fields;
    this.recordTypeId = recordTypeId;
    this.onEvent = onEvent;
    this.onStateChange = onStateChange;

    this.subscriptionId = null;
    this.mode = null;
    this.seq = 0;
    this.revoked = false;
  }

  async _subscribe() {
    const payload = { objectName: this.object, filter: this.filter, fields: this.fields };
    if (this.recordTypeId !== undefined) payload.recordTypeId = this.recordTypeId;

    const ack = await new Promise((resolve, reject) => {
      try {
        this.socket.emit('objects.liveQuery.subscribe', payload, resolve);
      } catch (err) {
        reject(err);
      }
    });

    if (!ack || ack.error) {
      throw new Error(ack?.error || 'liveQuery :: subscribe :: no ack received');
    }

    this.subscriptionId = ack.subscriptionId;
    this.mode = ack.mode;
    this.seq = 0;
    // Re-resolve the manager at registration time: if a concurrent
    // unsubscribe drained the manager while this subscribe was in flight,
    // destroy() stripped its socket listeners and dropped it from
    // socketManagers - registering onto that dead instance would leave this
    // handle deaf (server sub alive, frames arriving at the socket, nothing
    // listening). getSocketManager() returns a fresh, listening manager in
    // that case.
    this.manager = getSocketManager(this.socket);
    this.manager.register(this);
    this._setState('active');
    return ack;
  }

  async _resubscribe() {
    if (this.revoked) return;

    const previousId = this.subscriptionId;
    this._setState('resubscribing');
    // Stop routing events/heartbeats for the old (now-dead) subscriptionId;
    // the handle object itself is kept and rebound to a new one below.
    if (previousId) this.manager.unregister(previousId);

    try {
      await this._subscribe();
      this._emitEvent({ type: 'resync' });
    } catch (err) {
      console.warn(`liveQuery :: resubscribe :: ${this.object} :: ${err.message}`);
      // Left un-registered; the next 'connect' event will retry.
    }
  }

  _handleEvent(frame) {
    if (this.revoked) return;

    if (frame.type === 'revoked') {
      this._emitEvent(frame);
      this._setState('revoked');
      this._teardown();
      return;
    }

    if (typeof frame.seq === 'number') {
      if (this.seq && frame.seq > this.seq + 1) {
        this._emitEvent({ type: 'resync' });
      }
      if (frame.seq > this.seq) this.seq = frame.seq;
    }

    this._emitEvent(frame);
  }

  _emitEvent(frame) {
    if (typeof this.onEvent !== 'function') return;
    try {
      this.onEvent(frame);
    } catch (err) {
      console.error(`liveQuery :: onEvent handler :: ${this.object} :: threw :: ${err.message}`);
    }
  }

  _setState(state) {
    if (typeof this.onStateChange !== 'function') return;
    try {
      this.onStateChange(state);
    } catch (err) {
      console.error(`liveQuery :: onStateChange handler :: ${this.object} :: threw :: ${err.message}`);
    }
  }

  _teardown() {
    if (this.revoked) return;
    this.revoked = true;
    if (this.subscriptionId) this.manager.destroy(this.subscriptionId);
  }

  unsubscribe() {
    if (this.revoked) return;
    this.revoked = true;
    if (this.subscriptionId) {
      this.socket.emit('objects.liveQuery.unsubscribe', { subscriptionId: this.subscriptionId });
      this.manager.destroy(this.subscriptionId);
    }
  }
}

/**
 * sdk.objects.liveQuery({ socket, object, filter, fields, recordTypeId, onEvent, onStateChange })
 *
 * NOTE: `socket` is NOT part of the locked contract (see file header) — it's
 * a stopgap until the SDK owns its own transport. Passing it is required
 * today; treat this as a blocking open item, not a stable API.
 * - socket: optional socket.io-client instance already connected/authed for
 *   this account; falls back to `sdk.socket` if the sdk instance holds one.
 * - object, filter, fields, recordTypeId: subscribe-time query, same shape
 *   as `sdk.objects.query`.
 * - onEvent(frame): called for every 'enter'|'change'|'leave'|'refresh'|
 *   'resync'|'revoked' frame (resync frames are also synthesized locally on
 *   seq gaps and on reconnect).
 * - onStateChange(state): optional, called with 'active' | 'resubscribing' | 'revoked'.
 *
 * Resolves to { subscriptionId, mode, unsubscribe() }.
 */
export async function liveQuery(sdk, args = {}) {
  const { socket: providedSocket, object, filter, fields, recordTypeId, onEvent, onStateChange } = args;

  const socket = providedSocket || sdk.socket;
  if (!socket || typeof socket.emit !== 'function' || typeof socket.on !== 'function') {
    throw new Error(
      'liveQuery :: init :: a socket.io client instance is required (pass { socket } or set ' +
        'sdk.socket) — the SDK has no built-in socket transport yet; this is a known blocking ' +
        'deviation from the locked liveQuery contract, see plan Phase 3',
    );
  }
  if (!object) {
    throw new Error('liveQuery :: init :: object is required');
  }

  const manager = getSocketManager(socket);
  const handle = new LiveQueryHandle({
    manager,
    socket,
    object,
    filter,
    fields,
    recordTypeId,
    onEvent,
    onStateChange,
  });

  const ack = await handle._subscribe();

  return {
    subscriptionId: handle.subscriptionId,
    mode: ack.mode,
    unsubscribe: () => handle.unsubscribe(),
  };
}
