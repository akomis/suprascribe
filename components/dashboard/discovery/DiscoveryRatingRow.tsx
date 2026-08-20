'use client'

import { StarRating } from '@/components/shared/StarRating'
import { useInvalidateDiscoveryRuns } from '@/lib/hooks/discovery/useDiscoveryRuns'
import { useState } from 'react'
import { toast } from 'sonner'

interface DiscoveryRatingRowProps {
  runId: string
}

/** Compact feedback control shown on the left of the discovery review footer. */
export function DiscoveryRatingRow({ runId }: DiscoveryRatingRowProps) {
  const invalidateDiscoveryRuns = useInvalidateDiscoveryRuns()
  const [rating, setRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleRate = async (value: number) => {
    setRating(value)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/discovery/runs/${runId}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save rating')
      }

      invalidateDiscoveryRuns()
      setSubmitted(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save rating'
      toast.error('Could not save your rating', { description: message })
      setRating(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mr-auto flex shrink-0 flex-col items-start gap-0.5">
      <div className="flex items-center gap-1">
        <StarRating
          value={rating}
          onChange={handleRate}
          disabled={isSubmitting || submitted}
          starClassName="size-5"
        />
      </div>
      <span className="text-muted-foreground text-[11px] leading-none">
        {isSubmitting ? 'Submitting..' : submitted ? 'Submitted!' : 'Rate the results'}
      </span>
    </div>
  )
}
