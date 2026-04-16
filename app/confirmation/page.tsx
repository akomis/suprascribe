'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getEnabledFeaturesByTier, TIER } from '@/lib/config/features'
import { useAccountTier } from '@/lib/hooks/useAccount'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { data: tier, isLoading } = useAccountTier()

  const proFeatures = getEnabledFeaturesByTier(TIER.PRO)

  const handleManualRedirect = () => {
    router.push('/dashboard')
  }

  if (isLoading || tier === 'BASIC') {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold">PRO Activated</h1>

        <div className="w-fit mx-auto bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-lg px-10 py-4 space-y-2">
          <p className="font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Welcome to Pro!
          </p>
          <ul className="text-sm space-y-2 text-left">
            {proFeatures.map((feature) => (
              <li key={feature.key}>• {feature.description}</li>
            ))}
          </ul>
        </div>

        <Button onClick={handleManualRedirect} size="lg" className="w-full">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
