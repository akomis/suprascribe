import { ResetPasswordClient } from '@/components/auth/ResetPasswordClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
