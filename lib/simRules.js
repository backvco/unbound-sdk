/* eslint-disable indent */
/* eslint-disable prettier/prettier */

/*
 * Shared simulator identification rules (simulator-plan.md §5).
 *
 * Pure, dependency-free. Used by app1-api, app1-queue-messaging and
 * app1-simulator to recognize sim traffic by PATTERN, never by a flag:
 * +1555NXXXXXX (NPA 555 is unassignable in the NANP) and @sim.invalid
 * (RFC 2606 reserved domain). Fail closed everywhere these are consulted —
 * an address that doesn't match is treated as real, never routed to a sink.
 */

// NPA 555, 7 trailing digits -- no real subscriber can hold one.
export const SIM_NUMBER_RE = /^\+1555\d{7}$/;

export const SIM_EMAIL_DOMAIN = 'sim.invalid';

/**
 * @param {string} e164
 * @returns {boolean}
 */
export function isSimNumber(e164) {
  return typeof e164 === 'string' && SIM_NUMBER_RE.test(e164);
}

/**
 * @param {string} addr
 * @returns {boolean}
 */
export function isSimEmail(addr) {
  if (typeof addr !== 'string') return false;
  const at = addr.lastIndexOf('@');
  if (at === -1) return false;
  return addr.slice(at + 1).toLowerCase() === SIM_EMAIL_DOMAIN;
}

/**
 * Redis key for the per-account SIM MODE choke point (simulator-plan.md
 * §5, "Account SIM MODE"). Unprefixed -- callers in queue-messaging must
 * use a Redis client without its `queue-messaging:` keyPrefix to read it.
 *
 * @param {string} accountId
 * @returns {string}
 */
export function simModeKey(accountId) {
  return `sim:mode:${accountId}`;
}

export const simRules = {
  SIM_NUMBER_RE,
  SIM_EMAIL_DOMAIN,
  isSimNumber,
  isSimEmail,
  simModeKey,
};

export default simRules;
