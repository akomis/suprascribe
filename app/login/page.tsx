import { LoginClient } from '../../components/auth/LoginClient'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  // noindex keeps the page out of results; follow is deliberate. ~86 internal links point
  // here (every signup CTA), and nofollow stopped that PageRank dead instead of letting it
  // flow on through the logo link to / and the link to /terms-and-privacy.
  robots: { index: false, follow: true },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const initialTab =
    params?.tab === 'signup' || params?.tab === 'signin'
      ? (params.tab as 'signup' | 'signin')
      : 'signin'
  const errorParam = typeof params?.error === 'string' ? params.error : undefined

  return <LoginClient initialTab={initialTab} errorParam={errorParam} />
}
