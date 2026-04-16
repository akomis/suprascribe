import { createClient } from '@/lib/supabase/server'
import { getPostHogClient } from '@/lib/posthog-server'
import { encryptApiKey, decryptApiKey, getKeyHint } from '@/lib/utils/server-crypto'
import {
  validateApiKey,
  type LLMProvider,
  DEFAULT_MODELS,
  type ProviderConfig,
} from '@/lib/services/ai-provider'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: keys, error: keysError } = await supabase
    .from('USER_API_KEYS')
    .select('id, provider, key_hint, model, validated_at')
    .eq('user_id', user.id)

  if (keysError) {
    return NextResponse.json({ error: keysError.message }, { status: 500 })
  }

  const { data: settings } = await supabase
    .from('USER_SETTINGS')
    .select('active_key_id')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    keys: keys || [],
    activeKeyId: settings?.active_key_id || null,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    provider,
    apiKey,
    model,
    setAsActive = true,
  } = (await request.json()) as {
    provider: LLMProvider
    apiKey: string
    model: string
    setAsActive?: boolean
  }

  if (!provider || !apiKey || !model) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!(provider in DEFAULT_MODELS)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  if (provider !== 'openrouter') {
    if (!DEFAULT_MODELS[provider].includes(model)) {
      return NextResponse.json({ error: 'Invalid model for provider' }, { status: 400 })
    }

    const validation = await validateApiKey({ provider, apiKey, model })
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error || 'Invalid API key' }, { status: 400 })
    }
  }

  const encryptedKey = encryptApiKey(apiKey)
  const keyHint = getKeyHint(apiKey)

  const { data: insertedKey, error: insertError } = await supabase
    .from('USER_API_KEYS')
    .insert({
      user_id: user.id,
      provider,
      encrypted_key: encryptedKey,
      key_hint: keyHint,
      model,
      validated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  if (setAsActive && insertedKey) {
    await supabase.from('USER_SETTINGS').upsert(
      {
        user_id: user.id,
        active_key_id: insertedKey.id,
      },
      { onConflict: 'user_id' },
    )
  }

  const posthog = getPostHogClient()
  posthog.capture({
    distinctId: user.id,
    event: 'byok_api_key_added',
    properties: { provider, model },
  })
  await posthog.shutdown()

  return NextResponse.json({ success: true, keyHint, keyId: insertedKey?.id })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  if (!('keyId' in body)) {
    return NextResponse.json({ error: 'keyId field is required' }, { status: 400 })
  }

  const { keyId } = body

  if (keyId === null) {
    const { error } = await supabase
      .from('USER_SETTINGS')
      .update({ active_key_id: null })
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  const { data: key } = await supabase
    .from('USER_API_KEYS')
    .select('id')
    .eq('id', keyId)
    .eq('user_id', user.id)
    .single()

  if (!key) {
    return NextResponse.json({ error: 'Key not found' }, { status: 404 })
  }

  const { error } = await supabase.from('USER_SETTINGS').upsert(
    {
      user_id: user.id,
      active_key_id: keyId,
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const posthog = getPostHogClient()
  posthog.capture({
    distinctId: user.id,
    event: 'byok_api_key_activated',
    properties: { key_id: keyId },
  })
  await posthog.shutdown()

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { keyId } = await request.json()

  if (!keyId) {
    return NextResponse.json({ error: 'Key ID is required' }, { status: 400 })
  }

  const { data: settings } = await supabase
    .from('USER_SETTINGS')
    .select('active_key_id')
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('USER_API_KEYS')
    .delete()
    .eq('id', keyId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (settings?.active_key_id === keyId) {
    await supabase.from('USER_SETTINGS').update({ active_key_id: null }).eq('user_id', user.id)
  }

  const posthog = getPostHogClient()
  posthog.capture({
    distinctId: user.id,
    event: 'byok_api_key_removed',
    properties: { key_id: keyId },
  })
  await posthog.shutdown()

  return NextResponse.json({ success: true })
}

export async function getBYOKConfig(userId: string): Promise<ProviderConfig | null> {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('USER_SETTINGS')
    .select('active_key_id')
    .eq('user_id', userId)
    .single()

  if (!settings?.active_key_id) return null

  const { data: key } = await supabase
    .from('USER_API_KEYS')
    .select('provider, encrypted_key, model')
    .eq('id', settings.active_key_id)
    .single()

  if (!key) return null

  try {
    return {
      provider: key.provider as LLMProvider,
      apiKey: decryptApiKey(key.encrypted_key),
      model: key.model,
    }
  } catch {
    return null
  }
}
