'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/shared/BackButton'
import { SupportButton } from '@/components/shared/SupportButton'
import { Check, Copy, Link, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Affiliate {
  id: string
  code: string
  commission_rate: number
  created_at: string
}

interface Stats {
  conversions: number
  totalCommission: number
  pendingCommission: number
}

export default function AffiliatePage() {
  const router = useRouter()
  const [affiliate, setAffiliate] = useState<Affiliate | null | undefined>(undefined)
  const [stats, setStats] = useState<Stats | null>(null)
  const [copied, setCopied] = useState(false)

  const referralLink = affiliate ? `https://suprascribe.com?ref=${affiliate.code}` : ''

  useEffect(() => {
    fetch('/api/affiliate')
      .then((r) => r.json())
      .then(({ affiliate }) => setAffiliate(affiliate ?? null))
  }, [])

  useEffect(() => {
    if (!affiliate) return
    fetch('/api/affiliate/stats')
      .then((r) => r.json())
      .then(setStats)
  }, [affiliate])

  function copy() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (affiliate === undefined) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )
  }

  if (!affiliate) {
    return (
      <div className="max-w-md mx-auto mt-16 px-4">
        <div className="mb-4">
          <BackButton />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="size-5" />
              Affiliate Program
            </CardTitle>
            <CardDescription>
              Earn commission for every user you refer who upgrades to Pro. Affiliate links and
              dealrs are managed by us - reach out and we&apos;ll get you set up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/dashboard/support')}>
              Contact us
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-8 px-4 space-y-4 pb-12">
      <BackButton />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="size-5" />
            Your referral link
            <Badge variant="secondary" className="ml-auto">
              {Math.round(affiliate.commission_rate * 100)}% commission
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input value={referralLink} readOnly className="font-mono text-sm" />
          <Button variant="outline" size="icon" onClick={copy} aria-label="Copy referral link">
            {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats?.conversions ?? '-'}</p>
              <p className="text-xs text-muted-foreground mt-1">Conversions</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats ? `€${stats.totalCommission.toFixed(2)}` : '-'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats ? `€${stats.pendingCommission.toFixed(2)}` : '-'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Pending payout</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center pt-2 text-sm">
        Need help with anything? Feel free to contact{' '}
        <SupportButton className="pl-1 underline" variant="link" category="partnership" />
      </div>
    </div>
  )
}
