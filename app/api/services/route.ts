import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * The table is far larger than PostgREST's 1000-row ceiling, so it can never be
 * fetched whole - doing so silently truncates the catalogue mid-alphabet. Search
 * runs in Postgres and returns a slice big enough for the client to rank.
 */
const SEARCH_LIMIT = 50

/** `%`, `_` and PostgREST's `*` are pattern syntax, not text the user meant to type. */
function escapeLikePattern(term: string): string {
  return term.replace(/[%_*\\]/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const term = escapeLikePattern(request.nextUrl.searchParams.get('q')?.trim() ?? '')

    let query = supabase
      .from('SUBSCRIPTION_SERVICES')
      .select('id, name, url')
      .order('name', { ascending: true })
      .limit(SEARCH_LIMIT)

    if (term) {
      query = query.ilike('name', `%${term}%`)
    }

    const { data: services, error } = await query

    if (error) {
      console.error('Error fetching subscription services:', error)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    return NextResponse.json({ services: services || [] })
  } catch (error) {
    console.error('Error in services API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
