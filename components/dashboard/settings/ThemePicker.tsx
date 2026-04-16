'use client'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { capitalize, cn } from '@/lib/utils'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

type ThemePickerProps = {
  triggerClassName?: string
}

export function ThemePicker({ triggerClassName }: ThemePickerProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const Icon = themeIcons[theme as keyof typeof themeIcons] || Monitor

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className={cn('hover:cursor-pointer ', triggerClassName)}>
        <Icon className="h-4 w-4" />
        <span className="text-muted-foreground">{capitalize(theme ?? 'System')}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light" className="hover:cursor-pointer">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark" className="hover:cursor-pointer">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </SelectItem>
        <SelectItem value="system" className="hover:cursor-pointer">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>System</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
