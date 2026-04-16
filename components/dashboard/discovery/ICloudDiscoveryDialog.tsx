'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import * as React from 'react'

type ICloudDiscoveryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { email: string; password: string }) => void
  isLoading?: boolean
}

export function ICloudDiscoveryDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ICloudDiscoveryDialogProps) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Connect via iCloud</DialogTitle>
          <DialogDescription>
            Enter your iCloud email and app-specific password to scan for subscriptions.
          </DialogDescription>
          <div className="self-start text-center text-xs text-muted-foreground">
            Need help?{' '}
            <Link
              href="https://support.apple.com/en-us/102654"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Learn how to generate an iCloud app-specific password
            </Link>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="icloud-email">iCloud Email Address</Label>
              <Input
                id="icloud-email"
                type="email"
                placeholder="your@icloud.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icloud-password">App-Specific Password</Label>
              <Input
                id="icloud-password"
                type="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Connecting...' : 'Proceed'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ICloudDiscoveryDialog
