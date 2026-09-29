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

// Module-level (not per-SDK-instance) is deliberate: an app typically has
// one SDK instance per tab, and a genuinely different SDK instance
// refreshing concurrently should still share the single-flight guard so
// two SDK instances pointed at the same session don't both hit
// /login/refresh at once. If that turns out to be wrong for some caller,
// switch to a WeakMap<sdk, Promise> -- kept as a plain variable for now to
// match the simplicity of the rest of this file.
let inFlightRefresh = null;

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
  if (!inFlightRefresh) {
    inFlightRefresh = sdk.login
      .refresh()
      .then((result) => {
        // Bearer clients get a new access token back in the body; cookie
        // clients rely on the Set-Cookie the refresh response already sent
        // -- there is no token string to apply to the SDK instance for them.
        if (result?.token) sdk.setToken(result.token);
        return result;
      })
      .finally(() => {
        inFlightRefresh = null;
      });
  }
  return inFlightRefresh;
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
