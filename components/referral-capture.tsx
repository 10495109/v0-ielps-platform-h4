'use client'

import { useEffect } from 'react'
import { captureReferral } from '@/lib/referral'

/**
 * Records a partner-link arrival and carries the reference across sign-in.
 *
 * Mounted once for the whole app because a partner link can land on any page.
 * It renders nothing, it only acts when the URL actually carries a referral
 * code, and it creates no commercial record — the click route it calls is
 * public and the attribution itself happens after authentication, server-side.
 */
export function ReferralCapture() {
  useEffect(() => {
    captureReferral()
  }, [])
  return null
}
