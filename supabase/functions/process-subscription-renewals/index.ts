import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RenewalResult {
  renewed_count: number
  subscription_ids: number[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase.rpc('process_subscription_renewals')

    if (error) {
      console.error('Error processing renewals:', error)
      throw new Error(`Failed to process renewals: ${error.message}`)
    }

    const result = (data as RenewalResult[])[0] || { renewed_count: 0, subscription_ids: [] }

    console.log(`Processed ${result.renewed_count} renewals`)
    console.log(`Renewed subscription IDs: ${result.subscription_ids.join(', ')}`)

    return new Response(
      JSON.stringify({
        message: 'Subscription renewals processed successfully',
        renewed_count: result.renewed_count,
        subscription_ids: result.subscription_ids,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in process-subscription-renewals:', errMsg)

    return new Response(
      JSON.stringify({
        error: errMsg,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
