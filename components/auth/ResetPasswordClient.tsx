'use client'

import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z
  .object({
    password: z.string().min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof formSchema>

export function ResetPasswordClient() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validating, setValidating] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
  })

  // Check for valid session (set by /auth/confirm)
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        setError('No valid recovery session found. Please request a new password reset link.')
      }
      setValidating(false)
    }

    checkSession()
  }, [supabase])

  const onSubmit = handleSubmit(async ({ password }) => {
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success('Password updated successfully')

      // Sign out after password change to require re-login
      await supabase.auth.signOut()

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setError('Failed to update password. Please try again.')
      setLoading(false)
    }
  })

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/20">
        <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg border text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Validating session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/20 p-4">
        <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg border">
          <SuprascribeLogo layout="column" size={42} />

          <div className="mt-6 rounded-md bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/20 p-4">
        <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg border">
          <SuprascribeLogo layout="column" size={42} />

          <div className="mt-6 rounded-md bg-green-500/10 border border-green-500/20 p-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              Your password has been updated successfully!
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/20 p-4">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg border">
        <SuprascribeLogo layout="column" size={42} />

        <div className="mt-6">
          <h1 className="text-lg font-semibold text-center">Reset your password</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              disabled={loading}
              {...register('password')}
            />
            {errors.password?.message && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm new password"
              disabled={loading}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword?.message && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Spinner className="mr-2" />}
            {loading ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
