import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { hasFeatureAccess } from '@/lib/config/features'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userSettings } = await supabase
      .from('USER_SETTINGS')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    const userTier = userSettings?.tier || 'BASIC'
    const hasAccess = hasFeatureAccess(userTier, 'email_support')

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Email support is only available for Pro users' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { category, subject, message } = body

    if (!category || !subject || !message) {
      return NextResponse.json(
        { error: 'Category, subject and message are required' },
        { status: 400 },
      )
    }

    const categoryTag = category.toUpperCase().replace(/_/g, ' ')

    const { data, error } = await resend.emails.send({
      from: 'Suprascribe Support <support@suprascribe.com>',
      to: ['support@suprascribe.com'],
      replyTo: user.email,
      subject: `[${categoryTag}] ${subject}`,
      text: `
Support request from: ${user.email}
User ID: ${user.id}

${message}
      `.trim(),
    })

    if (error) {
      console.error('Failed to send email:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error('Support contact error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
