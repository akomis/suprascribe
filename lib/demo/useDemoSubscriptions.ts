'use client'

import { useCallback } from 'react'
import { useDemoContext } from '@/components/demo/DemoProvider'
import type { DemoMergedSubscription, DemoSubscriptionWithDetails } from '@/lib/demo/sampleData'
import type { CurrencyCode } from '@/lib/types/database'
import type { CreateSubscriptionFormData } from '@/lib/types/forms'

function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

function isActive(endDate: string): boolean {
  return new Date(endDate) >= new Date()
}

function createSubscriptionDetails(
  id: number,
  data: CreateSubscriptionFormData,
): DemoSubscriptionWithDetails {
  return {
    id,
    user_id: 'demo-user',
    subscription_service_id: id,
    price: data.price,
    currency: data.currency,
    start_date: data.startDate,
    end_date: data.endDate,
    auto_renew: data.autoRenew,
    payment_method: data.paymentMethod || null,
    source_email: null,
    category: data.serviceCategory || undefined,
    created_at: new Date().toISOString(),
    subscription_service: {
      name: data.serviceName,
      url: data.serviceUrl || null,
      unsubscribe_url: data.serviceUnsubscribeUrl || null,
    },
  }
}

export function useDemoSubscriptions() {
  const { subscriptions } = useDemoContext()

  return {
    data: subscriptions,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: true,
  }
}

export function useDemoCreateSubscription() {
  const { subscriptions, setSubscriptions } = useDemoContext()

  const mutateAsync = useCallback(
    async (data: CreateSubscriptionFormData): Promise<DemoSubscriptionWithDetails> => {
      const id = generateId()
      const subscriptionDetails = createSubscriptionDetails(id, data)

      const newMerged: DemoMergedSubscription = {
        name: data.serviceName,
        serviceUrl: data.serviceUrl,
        price: data.price,
        currency: data.currency as CurrencyCode,
        startDate: data.startDate,
        endDate: data.endDate,
        autoRenew: data.autoRenew,
        active: isActive(data.endDate),
        category: data.serviceCategory || undefined,
        spentThisYear: data.price,
        forecastThisYear: data.price * 12,
        totalSpent: data.price,
        subscriptions: [subscriptionDetails],
      }

      const existingIndex = subscriptions.findIndex(
        (s) => s.name.toLowerCase() === data.serviceName.toLowerCase(),
      )

      if (existingIndex >= 0) {
        setSubscriptions((prev) => {
          const updated = [...prev]
          updated[existingIndex] = {
            ...updated[existingIndex],
            subscriptions: [...updated[existingIndex].subscriptions, subscriptionDetails],
            price: data.price,
            currency: data.currency as CurrencyCode,
            startDate: data.startDate,
            endDate: data.endDate,
            autoRenew: data.autoRenew,
            active: isActive(data.endDate),
          }
          return updated
        })
      } else {
        setSubscriptions((prev) => [newMerged, ...prev])
      }

      return subscriptionDetails
    },
    [subscriptions, setSubscriptions],
  )

  return {
    mutateAsync,
    mutate: mutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }
}

export function useDemoUpdateSubscription() {
  const { setSubscriptions } = useDemoContext()

  const mutateAsync = useCallback(
    async ({
      id,
      data,
    }: {
      id: number
      data: CreateSubscriptionFormData
    }): Promise<DemoSubscriptionWithDetails> => {
      const updatedDetails = createSubscriptionDetails(id, data)

      setSubscriptions((prev) => {
        return prev.map((merged) => {
          const subIndex = merged.subscriptions.findIndex((s) => s.id === id)
          if (subIndex < 0) return merged

          const updatedSubscriptions = [...merged.subscriptions]
          updatedSubscriptions[subIndex] = updatedDetails

          return {
            ...merged,
            name: data.serviceName,
            serviceUrl: data.serviceUrl,
            price: data.price,
            currency: data.currency as CurrencyCode,
            startDate: data.startDate,
            endDate: data.endDate,
            autoRenew: data.autoRenew,
            active: isActive(data.endDate),
            subscriptions: updatedSubscriptions,
          }
        })
      })

      return updatedDetails
    },
    [setSubscriptions],
  )

  return {
    mutateAsync,
    mutate: mutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }
}

export function useDemoDeleteSubscription() {
  const { setSubscriptions } = useDemoContext()

  const mutateAsync = useCallback(
    async (subscriptionId: number): Promise<void> => {
      setSubscriptions((prev) => {
        return prev
          .map((merged) => {
            const filteredSubs = merged.subscriptions.filter((s) => s.id !== subscriptionId)

            if (filteredSubs.length === 0) return null

            return {
              ...merged,
              subscriptions: filteredSubs,
            }
          })
          .filter((m): m is DemoMergedSubscription => m !== null)
      })
    },
    [setSubscriptions],
  )

  return {
    mutateAsync,
    mutate: mutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }
}
