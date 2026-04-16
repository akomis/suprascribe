'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBYOKSettings } from '@/lib/hooks/useBYOKSettings'
import { DEFAULT_MODELS, PROVIDER_NAMES, type LLMProvider } from '@/lib/services/ai-provider'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Circle, Loader2, Plus, Trash2 } from 'lucide-react'
import * as React from 'react'

const PROVIDERS: { value: LLMProvider; label: string }[] = (
  Object.entries(PROVIDER_NAMES) as [LLMProvider, string][]
).map(([value, label]) => ({ value, label }))

export function BYOKSettings() {
  const {
    keys,
    activeKeyId,
    saveKey,
    deleteKey,
    setActiveKey,
    isLoading,
    isSaving,
    isDeleting,
    isSettingActive,
  } = useBYOKSettings()

  const [showAddForm, setShowAddForm] = React.useState(false)
  const [provider, setProvider] = React.useState<LLMProvider>('anthropic')
  const [model, setModel] = React.useState('')
  const [apiKey, setApiKey] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const handleProviderChange = (p: LLMProvider) => {
    setProvider(p)
    setModel('')
    setError(null)
  }

  const handleSave = async () => {
    setError(null)
    const result = await saveKey({ provider, model, apiKey })
    if (result.error) {
      setError(result.error)
    } else {
      setApiKey('')
      setModel('')
      setShowAddForm(false)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setApiKey('')
    setModel('')
    setError(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-h-[500px] overflow-y-auto space-y-4">
      {/* Existing keys list */}
      {keys.length > 0 && (
        <div className="space-y-2">
          {keys.map((key) => {
            const isActive = key.id === activeKeyId
            return (
              <div
                key={key.id}
                onClick={
                  !isSettingActive ? () => setActiveKey(isActive ? null : key.id) : undefined
                }
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 transition-colors cursor-pointer',
                  isActive
                    ? 'border-green-500/50 bg-green-500/5 hover:border-green-500/30 hover:bg-green-500/10'
                    : 'hover:border-primary/50 hover:bg-muted/50',
                )}
                title={isActive ? 'Click to disable' : 'Click to set as active'}
              >
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {PROVIDER_NAMES[key.provider as LLMProvider]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {key.model} &middot; {key.key_hint}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteKey(key.id)
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add new key form */}
      {showAddForm ? (
        <div className="space-y-4 rounded-lg border border-dashed p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="w-full space-y-2 sm:w-fit">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-2 sm:flex-1">
              <Label>Model</Label>
              {provider === 'openrouter' ? (
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. google/gemini-2.5-flash-lite"
                />
              ) : (
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_MODELS[provider].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setError(null)
              }}
              placeholder="your-api-key"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!apiKey || !model || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {provider === 'openrouter' ? 'Saving...' : 'Validating...'}
                </>
              ) : (
                'Save API Key'
              )}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowAddForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add API Key
        </Button>
      )}

      {keys.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No API keys configured. Add one to enable unlimited discoveries.
        </p>
      )}
    </div>
  )
}
