import type { Metadata } from 'next'
import { CertificateVerifier } from '@/components/certificate-verifier'

export const metadata: Metadata = {
  title: 'Verify an IELPS certificate',
  robots: { index: false, follow: false },
}

export default function VerifyCertificatePage() {
  return <CertificateVerifier />
}
