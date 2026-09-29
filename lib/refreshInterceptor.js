// api#222 client contract -- single-flight 401 -> refresh -> retry-once.
// base.js's `#request` funnels BOTH the Socket.IO transport and the plain
// HTTP fallback through the same `_processResponse` (see base.js), so this
// one hook covers every transport without a per-transport copy.
//
// Usage (base.js only -- app code never imports this directly):
//   handleUnauthorized(sdk, { status, endpoint, retry, originalError })
//
// `retry` is a caller-supplied () => Promise that re-issues the ORIGINAL
// request. It has to come from the caller because #request is a private
// class field method -- this module can't call it directly.

// Keyed per SDK instance: a shared module-level variable would let one
// SDK instance's refresh starve a concurrent, unrelated SDK instance's own
// 401 recovery (a different user/session in the same Node process -- the
// API itself increasingly consumes this SDK server-side). Each instance
// still single-flights its own concurrent 401s against itself.
const inFlightRefreshBySdk = new WeakMap();

function isLoginRoute(endpoint) {
  return typeof endpoint === 'string' && endpoint.startsWith('/login');
}

export function shouldAttemptRefresh(sdk, status, endpoint) {
  return (
    status === 401 &&
    sdk?._autoRefresh === true &&
    !isLoginRoute(endpoint) &&
    typeof sdk?.login?.refresh === 'function'
  );
}

async function runRefresh(sdk) {
  let inFlight = inFlightRefreshBySdk.get(sdk);
  if (!inFlight) {
    // Bearer clients (constructed with a raw token, no browser cookie jar)
    // have to hand their raw refresh token back on every call -- the SDK
    // never gets one implicitly the way a cookie client's browser does.
    // sdk._refreshToken is set from login/refresh's own response below, or
    // may be seeded via sdk.setRefreshToken() by a caller that obtained it
    // out of band. Cookie clients simply have no stored value: `undefined`
    // is fine, refresh() omits body.refreshToken and relies on the cookie.
    inFlight = sdk.login
      .refresh(sdk._refreshToken)
      .then((result) => {
        // Bearer clients get a new access token AND a new (rotated) refresh
        // token back in the body; cookie clients rely on the Set-Cookie
        // pair the refresh response already sent -- there is no token
        // string to apply to the SDK instance for them.
        if (result?.token) sdk.setToken(result.token);
        if (result?.refreshToken) sdk._refreshToken = result.refreshToken;
        return result;
      })
      .finally(() => {
        inFlightRefreshBySdk.delete(sdk);
      });
    inFlightRefreshBySdk.set(sdk, inFlight);
  }
  return inFlight;
}

function notifyUnauthorized(sdk, err) {
  if (typeof sdk?._onUnauthorized !== 'function') return;
  try {
    sdk._onUnauthorized(err);
  } catch (callbackErr) {
    console.error(
      'refreshInterceptor :: onUnauthorized callback threw ::',
      callbackErr,
    );
  }
}

/**
 * @param {object} sdk
 * @param {object} ctx
 * @param {number} ctx.status
 * @param {string} ctx.endpoint
 * @param {() => Promise<any>} ctx.retry
 * @param {Error} ctx.originalError -- rethrown whenever refresh isn't
 *   attempted, fails, or the retry itself still comes back 401 (never loop
 *   past one retry).
 * @param {boolean} [ctx.alreadyRetried]
 */
export async function handleUnauthorized(
  sdk,
  { status, endpoint, retry, originalError, alreadyRetried = false },
) {
  if (alreadyRetried || !shouldAttemptRefresh(sdk, status, endpoint)) {
    throw originalError;
  }

  try {
    await runRefresh(sdk);
  } catch (refreshErr) {
    notifyUnauthorized(sdk, originalError);
    throw originalError;
  }

  try {
    return await retry();
  } catch (retryErr) {
    if (retryErr?.status === 401) notifyUnauthorized(sdk, retryErr);
    throw retryErr;
  }
}
