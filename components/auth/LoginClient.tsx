'use client'

import { SSOButton } from '@/components/auth/SSOButton'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface LoginClientProps {
  initialTab: 'signin' | 'signup'
  errorParam?: string
}

export function LoginClient({ initialTab, errorParam }: LoginClientProps) {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab)
  const [signedUp, setSignedUp] = useState(false)
  const [view, setView] = useState<'auth' | 'forgotPassword'>('auth')
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (errorParam) {
      const decoded = decodeURIComponent(errorParam)
      setServerError(decoded)
      toast.error('Authentication failed', {
        description: decoded,
      })
    }
  }, [errorParam])

  const formSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
  })

  type FormValues = z.infer<typeof formSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
  })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setLoading(true)
    setServerError(null)

    if (activeTab === 'signin') {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setServerError(error.message)
        setLoading(false)
        return
      }
      if (signInData.user) {
        posthog.identify(signInData.user.id, { email: signInData.user.email })
        posthog.capture('user_signed_in', { method: 'email' })
      }
      router.push('/dashboard')
      router.refresh()
      return
    }

    const { data: signUpData, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }
    if (signUpData.user) {
      posthog.identify(signUpData.user.id, { email: signUpData.user.email })
      posthog.capture('user_signed_up', { method: 'email' })
    }
    toast.success('Check your email', {
      description: 'We sent you a confirmation link to complete sign up.',
      duration: Infinity,
    })
    setSignedUp(true)
    setLoading(false)
    setActiveTab('signin')
    setValue('password', '')
  })

  const handleForgotPassword = async () => {
    if (!forgotEmail) return
    setForgotLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    })
    setForgotLoading(false)
    if (error) {
      toast.error('Failed to send reset email', { description: error.message })
      return
    }
    posthog.capture('password_reset_requested')
    setResetSent(true)
  }

  const openForgotPassword = () => {
    setForgotEmail(getValues('email'))
    setResetSent(false)
    setView('forgotPassword')
  }

  return (
    <div className="p-2 flex min-h-screen items-center justify-center bg-secondary/20">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg border">
        <SuprascribeLogo layout="column" size={42} />

        {view === 'forgotPassword' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Reset your password</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {resetSent ? (
              <div className="rounded-md bg-green-500/10 border border-green-500/20 p-4">
                <p className="text-sm text-green-700 dark:text-green-400">
                  Check your email for a password reset link.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={forgotLoading}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading || !forgotEmail}
                  className="flex w-full items-center justify-center gap-2"
                >
                  {forgotLoading && <Spinner aria-hidden="true" />}
                  <span>{forgotLoading ? '' : 'Send reset link'}</span>
                </Button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setView('auth')}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex rounded-md bg-secondary p-1">
                <Button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  variant={activeTab === 'signin' ? 'outline' : 'ghost'}
                  className="w-1/2 rounded-md px-4 py-2 text-sm font-medium transition"
                >
                  Sign in
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  variant={activeTab === 'signup' ? 'outline' : 'ghost'}
                  className="w-1/2 rounded-md px-4 py-2 text-sm font-medium transition"
                >
                  Sign up
                </Button>
              </div>

              <div className="space-y-3 mt-6">
                <SSOButton
                  provider="google"
                  disabled={loading || (activeTab === 'signup' && signedUp)}
                />
                <SSOButton
                  provider="azure"
                  disabled={loading || (activeTab === 'signup' && signedUp)}
                />
                <SSOButton
                  provider="apple"
                  disabled={loading || (activeTab === 'signup' && signedUp)}
                />
              </div>

              <div className="flex items-center gap-4 mt-6">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">Or continue with email</span>
                <Separator className="flex-1" />
              </div>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    {...register('email')}
                    placeholder="Email address"
                    disabled={loading || (activeTab === 'signup' && signedUp)}
                  />
                  {errors.email?.message && (
                    <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {activeTab === 'signin' && (
                      <button
                        type="button"
                        onClick={openForgotPassword}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={activeTab === 'signin' ? 'current-password' : 'new-password'}
                    required
                    {...register('password')}
                    placeholder="Password"
                    disabled={loading || (activeTab === 'signup' && signedUp)}
                  />
                  {errors.password?.message && (
                    <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading || (activeTab === 'signup' && signedUp)}
                  data-loading={loading ? 'true' : 'false'}
                  aria-busy={loading}
                  variant={activeTab === 'signin' ? 'default' : 'secondary'}
                  className="group relative flex w-full items-center justify-center gap-2"
                >
                  {loading && <Spinner aria-hidden="true" />}
                  <span>
                    {activeTab === 'signin' ? (loading ? '' : 'Sign in') : loading ? '' : 'Sign up'}
                  </span>
                </Button>
              </div>

              {activeTab === 'signup' && (
                <p className="text-center text-xs text-muted-foreground">
                  By signing up, you agree to our{' '}
                  <Link href="/terms-and-privacy" className="underline hover:text-foreground">
                    Terms of Service and Privacy Policy
                  </Link>
                  .
                </p>
              )}

              {serverError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
                  <p className="text-sm text-destructive">{serverError}</p>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
