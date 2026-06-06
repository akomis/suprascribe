import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

type Client = Awaited<ReturnType<typeof createClient>>
type AdminClient = ReturnType<typeof createServiceClient>

type AuthContext = { user: User; supabase: Client }

export function withAuth<
  Ctx extends Record<string, unknown> = { params: Promise<Record<string, string | string[]>> },
>(handler: (req: NextRequest, ctx: AuthContext & Ctx) => Promise<NextResponse>) {
  return async (req: NextRequest, routeCtx: Ctx) => {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handler(req, { user, supabase, ...routeCtx } as AuthContext & Ctx)
  }
}

export function withAdminAuth(
  handler: (req: NextRequest, ctx: AuthContext & { admin: AdminClient }) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handler(req, { user, supabase, admin: createServiceClient() })
  }
}
