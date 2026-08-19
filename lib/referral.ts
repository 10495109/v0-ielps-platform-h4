'use client'

import { partnersApi } from './adapters'

/**
 * Referral attribution across sign-in.
 *
 * The problem this solves is that the two halves of an attribution happen at
 * different times and under different identities. Somebody arrives from a
 * partner link while signed out; the account that the referral belongs to does
 * not exist yet, or is not signed in yet. If the reference is not carried
 * across authentication it is simply lost, and the partner is not credited for
 * a signup they genuinely produced.
 *
 * What the browser is allowed to do here is narrow, and deliberately so.
 *
 * On arrival it records the click through the public route and remembers the
 * code. `GET /api/partners/track/:code` is unauthenticated by design: it counts
 * the click and sets the visitor cookie, and it creates no commercial record
 * of any kind. Nothing is credited at this point and nothing could be.
 *
 * After a successful sign-in — and only then — it hands the code over once to
 * `POST /api/partners/attribute`, which is authenticated. From that point the
 * server owns the decision entirely: it resolves the code, writes the referral
 * attribution against the now-known account, scores it for risk and holds it
 * for fraud review when the score is high enough. A self-referral is caught
 * there, not here.
 *
 * The browser therefore never awards a commission, never computes one, and
 * never writes to a commercial ledger. It carries a string across a login and
 * then forgets it. The code is cleared as soon as it has been handed over, so a
 * later sign-in on the same device cannot re-attribute it.
 */

const STORAGE_KEY = 'ielps.referral.code'
const PARAM_KEYS = ['ref', 'referral', 'partner']

function readStored(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function clearStored() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable: the attribution is simply not carried */
  }
}

/**
 * Capture a referral code from the current URL and record the click.
 *
 * Safe to call on every page load: it does nothing without a code in the URL,
 * and it does not overwrite a code already being carried, so a partner link
 * followed by internal navigation keeps the original reference.
 */
export function captureReferral() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const raw = PARAM_KEYS.map((key) => params.get(key)).find(Boolean)
  if (!raw) return
  const code = raw.trim().slice(0, 80)
  if (!code || readStored()) return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, code)
  } catch {
    return
  }
  // The public click record. No account, no ledger entry, no commission.
  void partnersApi.track(code).catch(() => undefined)
}

/**
 * Submit the carried referral, once, after authentication has succeeded.
 *
 * Returns the server's answer when it attributed, and null when there was
 * nothing to submit or the server refused. A refusal is not retried and not
 * surfaced as a failure of the sign-in: the account is signed in either way,
 * and the attribution is the server's to accept or reject.
 */
export async function attributeReferralAfterSignIn() {
  if (typeof window === 'undefined') return null
  const code = readStored()
  if (!code) return null
  // Cleared before the request, not after: a request that fails must not leave
  // a code behind that a later sign-in would submit a second time.
  clearStored()
  try {
    return await partnersApi.attribute(code)
  } catch {
    return null
  }
}
