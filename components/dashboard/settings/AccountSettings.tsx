'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useDeleteAccount, useResetAccountData, useUpdateEmail } from '@/lib/hooks/useAccount'
import { useDiscoveryRuns } from '@/lib/hooks/discovery/useDiscoveryRuns'
import { createClient } from '@/lib/supabase/client'
import { Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import * as React from 'react'

type AccountSettingsProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string | null
  showPasswordChange?: boolean
}

export function AccountSettings({
  open,
  onOpenChange,
  email,
  showPasswordChange,
}: AccountSettingsProps) {
  const [currentEmail, setCurrentEmail] = React.useState(email ?? '')
  const [isEditingEmail, setIsEditingEmail] = React.useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = React.useState('')
  const [resetConfirmText, setResetConfirmText] = React.useState('')
  const [view, setView] = React.useState<'default' | 'passwordChange'>('default')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [passwordLoading, setPasswordLoading] = React.useState(false)
  const [resetSent, setResetSent] = React.useState(false)
  const [resetLoading, setResetLoading] = React.useState(false)
  const updateEmail = useUpdateEmail()
  const deleteAccount = useDeleteAccount()
  const resetAccountData = useResetAccountData()
  const { data: runs, isLoading: isLoadingRuns } = useDiscoveryRuns()

  React.useEffect(() => {
    setCurrentEmail(email ?? '')
  }, [email])

  React.useEffect(() => {
    if (showPasswordChange) {
      setView('passwordChange')
    }
  }, [showPasswordChange])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setView('default')
      setNewPassword('')
      setConfirmPassword('')
      setResetSent(false)
      setIsEditingEmail(false)
      setDeleteConfirmText('')
      setResetConfirmText('')
    }
    onOpenChange(isOpen)
  }

  const handleUpdateEmail = async () => {
    await updateEmail.mutateAsync(currentEmail)
    setIsEditingEmail(false)
    onOpenChange(false)
  }

  const handleDeleteAccount = () => {
    deleteAccount.mutate()
  }

  const handleResetAccountData = () => {
    resetAccountData.mutate()
  }

  const handleSendPasswordReset = async () => {
    if (!email) return
    setResetLoading(true)
    const supabase = createClient()
    const next = encodeURIComponent('/dashboard?settings=password')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
    })
    setResetLoading(false)
    if (error) {
      toast.error('Failed to send reset email', { description: error.message })
      return
    }
    setResetSent(true)
    toast.success('Check your email for a password reset link.')
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setPasswordLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error('Failed to update password', { description: error.message })
      setPasswordLoading(false)
      return
    }
    await supabase.auth.signOut({ scope: 'others' })
    setPasswordLoading(false)
    toast.success('Password updated. All other sessions have been signed out.')
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-[300px] max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account Settings
          </DialogTitle>
        </DialogHeader>

        {view === 'passwordChange' ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">Enter your new password below.</p>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setView('default')} disabled={passwordLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading || !newPassword || !confirmPassword}
              >
                {passwordLoading ? 'Updating...' : 'Update password'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={!isEditingEmail}
                />
                {isEditingEmail ? (
                  <Button
                    onClick={handleUpdateEmail}
                    disabled={
                      updateEmail.isPending || !currentEmail || currentEmail === (email ?? '')
                    }
                  >
                    Update
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditingEmail(true)}>Edit</Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Discovery History</div>
              {isLoadingRuns ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !runs?.length ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No discovery runs yet.
                </p>
              ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  {runs.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between text-sm rounded-md border px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{run.email_address}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(run.discovered_at).toLocaleDateString()} · {run.provider}
                          {run.is_byok && ' · BYOK'}
                        </p>
                      </div>
                      <Badge variant="outline">{run.subscriptions_found} found</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <Button
                variant="outline"
                onClick={handleSendPasswordReset}
                disabled={resetLoading || resetSent || !email}
              >
                {resetSent ? 'Reset link sent' : 'Reset password'}
              </Button>

              <div className="flex flex-col sm:flex-row gap-4">
                <AlertDialog
                  onOpenChange={(isOpen) => {
                    if (!isOpen) setResetConfirmText('')
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-destructive"
                      disabled={resetAccountData.isPending}
                    >
                      Reset data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset account data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is permanent and cannot be undone. All current and past
                        subscriptions, as well as your discovery history, will be permanently
                        deleted. Type <strong>RESET</strong> to confirm.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      value={resetConfirmText}
                      onChange={(e) => setResetConfirmText(e.target.value)}
                      placeholder="Type RESET to confirm"
                      className="mt-2"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={resetAccountData.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetAccountData}
                        disabled={resetAccountData.isPending || resetConfirmText !== 'RESET'}
                      >
                        RESET
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                  onOpenChange={(isOpen) => {
                    if (!isOpen) setDeleteConfirmText('')
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-destructive"
                      disabled={deleteAccount.isPending}
                    >
                      Delete account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is permanent and will remove your account and all associated
                        data. Type <strong>DELETE</strong> to confirm.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="mt-2"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleteAccount.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleteAccount.isPending || deleteConfirmText !== 'DELETE'}
                      >
                        DELETE
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AccountSettings
