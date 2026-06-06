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
import {
  DEFAULT_MODELS,
  PROVIDER_NAMES,
  type LLMProvider,
} from '@/lib/services/ai-provider-constants'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Circle, Loader2, Plus, Trash2 } from 'lucide-react'
import * as React from 'react'

const PROVIDERS: { value: LLMProvider; label: string }[] = (
  Object.entries(PROVIDER_NAMES) as [LLMProvider, string][]
).map(([value, label]) => ({ value, label }))

function KeyCard({
  keyEntry,
  isActive,
  isDeleting,
  isSettingActive,
  onActivate,
  onDelete,
}: {
  keyEntry: { id: string; provider: string; model: string; key_hint: string }
  isActive: boolean
  isDeleting: boolean
  isSettingActive: boolean
  onActivate: (id: string | null) => void
  onDelete: () => void
}) {
  return (
    <div
      onClick={!isSettingActive ? () => onActivate(isActive ? null : keyEntry.id) : undefined}
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
          <p className="font-medium text-sm">{PROVIDER_NAMES[keyEntry.provider as LLMProvider]}</p>
          <p className="text-xs text-muted-foreground">
            {keyEntry.model} &middot; {keyEntry.key_hint}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete API key"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
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
}

function AddKeyForm({
  provider,
  model,
  apiKey,
  error,
  isSaving,
  onProviderChange,
  onModelChange,
  onApiKeyChange,
  onSave,
  onCancel,
}: {
  provider: LLMProvider
  model: string
  apiKey: string
  error: string | null
  isSaving: boolean
  onProviderChange: (p: LLMProvider) => void
  onModelChange: (m: string) => void
  onApiKeyChange: (k: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4 rounded-lg border border-dashed p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="w-full space-y-2 sm:w-fit">
          <Label>Provider</Label>
          <Select value={provider} onValueChange={onProviderChange}>
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
              onChange={(e) => onModelChange(e.target.value)}
              placeholder="e.g. google/gemini-2.5-flash-lite"
            />
          ) : (
            <Select value={model} onValueChange={onModelChange}>
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
          onChange={(e) => onApiKeyChange(e.target.value)}
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
        <Button onClick={onSave} disabled={!apiKey || !model || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {provider === 'openrouter' ? 'Saving...' : 'Validating...'}
            </>
          ) : (
            'Save API Key'
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

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
      {keys.length > 0 && (
        <div className="space-y-2">
          {keys.map((key) => (
            <KeyCard
              key={key.id}
              keyEntry={key}
              isActive={key.id === activeKeyId}
              isDeleting={isDeleting}
              isSettingActive={isSettingActive}
              onActivate={setActiveKey}
              onDelete={() => deleteKey(key.id)}
            />
          ))}
        </div>
      )}

      {showAddForm ? (
        <AddKeyForm
          provider={provider}
          model={model}
          apiKey={apiKey}
          error={error}
          isSaving={isSaving}
          onProviderChange={handleProviderChange}
          onModelChange={setModel}
          onApiKeyChange={(k) => {
            setApiKey(k)
            setError(null)
          }}
          onSave={handleSave}
          onCancel={handleCancel}
        />
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
