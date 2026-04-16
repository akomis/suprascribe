import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface ReminderSettings {
  email_reminders_enabled: boolean
  reminder_days_before: number
}

const reminderKeys = {
  all: ['reminder-settings'] as const,
  settings: () => [...reminderKeys.all, 'settings'] as const,
}

async function fetchReminderSettings(): Promise<ReminderSettings> {
  const res = await fetch('/api/user/reminder-settings')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to fetch reminder settings')
  }
  return res.json()
}

async function updateReminderSettings(settings: Partial<ReminderSettings>): Promise<void> {
  const res = await fetch('/api/user/reminder-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to update reminder settings')
  }
}

export function useReminderSettings() {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: reminderKeys.settings(),
    queryFn: fetchReminderSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const updateMutation = useMutation({
    mutationFn: updateReminderSettings,
    onSuccess: () => {
      toast.success('Reminder settings updated')
      queryClient.invalidateQueries({ queryKey: reminderKeys.settings() })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return {
    settings: settingsQuery.data ?? {
      email_reminders_enabled: false,
      reminder_days_before: 3,
    },
    isLoading: settingsQuery.isLoading,
    isUpdating: updateMutation.isPending,
    updateSettings: updateMutation.mutate,
    error: settingsQuery.error as Error | null,
  }
}
