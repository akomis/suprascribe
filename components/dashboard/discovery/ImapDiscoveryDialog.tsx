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
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import * as React from 'react'

type ImapDiscoveryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    server: string
    port: string
    email: string
    password: string
    useTls: boolean
  }) => void
  isLoading?: boolean
}

export function ImapDiscoveryDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ImapDiscoveryDialogProps) {
  const [imapServer, setImapServer] = React.useState('')
  const [imapPort, setImapPort] = React.useState('993')
  const [imapEmail, setImapEmail] = React.useState('')
  const [imapPassword, setImapPassword] = React.useState('')

  const getTlsFromPort = (port: string): boolean => {
    const portNum = parseInt(port)
    const securePorts = [993, 465, 587]
    return securePorts.includes(portNum)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      server: imapServer,
      port: imapPort,
      email: imapEmail,
      password: imapPassword,
      useTls: getTlsFromPort(imapPort),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Connect via IMAP</DialogTitle>
          <DialogDescription>
            Enter your email provider&apos;s IMAP settings to scan for subscriptions.
          </DialogDescription>
          <div className="self-start text-center text-xs text-muted-foreground">
            Need help?{' '}
            <Link
              href="/imap"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Learn how to generate app passwords and connect with IMAP
            </Link>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="imap-server">IMAP Server</Label>
                <Input
                  id="imap-server"
                  type="text"
                  placeholder="imap.example.com"
                  value={imapServer}
                  onChange={(e) => setImapServer(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2 w-full md:w-[120px]">
                <Label htmlFor="imap-port">Port</Label>
                <Input
                  id="imap-port"
                  type="number"
                  placeholder="993"
                  value={imapPort}
                  onChange={(e) => setImapPort(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <Separator orientation="horizontal" />

            <div className="space-y-2">
              <Label htmlFor="imap-email">Email Address</Label>
              <Input
                id="imap-email"
                type="email"
                placeholder="your@email.com"
                value={imapEmail}
                onChange={(e) => setImapEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imap-password">App Password</Label>
              <Input
                id="imap-password"
                type="password"
                placeholder="Your app-specific password"
                value={imapPassword}
                onChange={(e) => setImapPassword(e.target.value)}
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

export default ImapDiscoveryDialog
