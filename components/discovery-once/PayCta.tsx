'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useState } from 'react'
import { toast } from 'sonner'

export function PayCta() {
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/discovery/once/checkout', { method: 'POST' })
      const data = (await res.json()) as { url?: string }
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error('no url')
    } catch {
      toast.error('Could not start checkout', { description: 'Please try again.' })
      setLoading(false)
    }
  }

  return (
    <Button size="lg" onClick={onClick} disabled={loading} className="min-w-[220px]">
      {loading ? <Spinner /> : 'Scan one inbox for €1'}
    </Button>
  )
}
