export function serviceNamesMatch(name1: string, name2: string): boolean {
  return name1.toLowerCase().trim() === name2.toLowerCase().trim()
}

export function getServiceNameKey(serviceName: string): string {
  return serviceName.toLowerCase().trim()
}

export function normalizeDateForComparison(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr.trim() === '') return null

  const trimmed = dateStr.trim()

  const dateOnlyMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/)
  if (dateOnlyMatch) {
    return dateOnlyMatch[1]
  }

  try {
    const date = new Date(trimmed)
    if (isNaN(date.getTime())) {
      return null
    }
    return date.toISOString().split('T')[0]
  } catch {
    return null
  }
}

export function isDuplicateSubscription(
  discovered: {
    service_name: string
    start_date: string
    end_date: string
  },
  existing: {
    subscription_service?: { name: string | null } | null
    start_date: string | null
    end_date: string | null
  },
): boolean {
  const discoveredServiceName = discovered.service_name
  const existingServiceName = existing.subscription_service?.name || ''

  if (!serviceNamesMatch(discoveredServiceName, existingServiceName)) {
    return false
  }

  const discoveredStartDate = normalizeDateForComparison(discovered.start_date)
  const existingStartDate = normalizeDateForComparison(existing.start_date)
  const discoveredEndDate = normalizeDateForComparison(discovered.end_date)
  const existingEndDate = normalizeDateForComparison(existing.end_date)

  if (!discoveredStartDate || !existingStartDate || !discoveredEndDate || !existingEndDate) {
    return false
  }

  return discoveredStartDate === existingStartDate && discoveredEndDate === existingEndDate
}
