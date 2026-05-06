import { withAuth } from '@/lib/api/withAuth'
import { captureEvent } from '@/lib/posthog-server'
import { encryptApiKey, getKeyHint } from '@/lib/utils/server-crypto'
import { validateApiKey, type LLMProvider, DEFAULT_MODELS } from '@/lib/services/ai-provider'
import { getUserTier } from '@/lib/supabase/tier'
import { NextResponse } from 'next/server'

export const GET = withAuth(async (_req, { user, supabase }) => {
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
})

export const POST = withAuth(async (request, { user, supabase }) => {
  const tier = await getUserTier(supabase, user.id)
  if (tier !== 'PRO') {
    return NextResponse.json({ error: 'BYOK requires a Pro subscription' }, { status: 403 })
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

  void captureEvent(user.id, 'byok_api_key_added', { provider, model })

  return NextResponse.json({ success: true, keyHint, keyId: insertedKey?.id })
})

export const PUT = withAuth(async (request, { user, supabase }) => {
  const tier = await getUserTier(supabase, user.id)
  if (tier !== 'PRO') {
    return NextResponse.json({ error: 'BYOK requires a Pro subscription' }, { status: 403 })
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

  void captureEvent(user.id, 'byok_api_key_activated', { key_id: keyId })

  return NextResponse.json({ success: true })
})

export const DELETE = withAuth(async (request, { user, supabase }) => {
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

  void captureEvent(user.id, 'byok_api_key_removed', { key_id: keyId })

  return NextResponse.json({ success: true })
})
