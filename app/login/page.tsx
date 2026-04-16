import { LoginClient } from '../../components/auth/LoginClient'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
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
