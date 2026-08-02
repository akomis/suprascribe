'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getEnabledFeaturesByTier, TIER } from '@/lib/config/features'
import { useAccountTier } from '@/lib/hooks/useAccount'
import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { data: tier, isLoading } = useAccountTier()

  const basicFeatures = getEnabledFeaturesByTier(TIER.BASIC)
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
      <div className="w-full max-w-md  text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold">PRO Activated</h1>

        <div className="w-fit mx-auto bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-lg px-6 py-4 space-y-2">
          <ul className="text-sm space-y-2 text-left">
            {proFeatures.map((feature) => (
              <li key={feature.key}>• {feature.description}</li>
            ))}
            <div className="flex flex-col gap-2 mt-8 ">
              <p>Along with all core features:</p>
              <ul className="text-sm space-y-2 text-left text-neutral-300">
                {basicFeatures.map((feature) => (
                  <li key={feature.key}>• {feature.description}</li>
                ))}
              </ul>
            </div>
          </ul>
        </div>

        <Button onClick={handleManualRedirect} size="lg" className="w-full">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
