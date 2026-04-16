import { getPostHogClient } from '@/lib/posthog-server'
import { rateLimit } from '@/lib/utils/rate-limit'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, 3, 15 * 60 * 1000, 'contact')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'Suprascribe Contact <contact@suprascribe.com>',
      to: ['contact@suprascribe.com'],
      replyTo: email,
      subject: `[CONTACT] ${subject}`,
      text: `
Contact form submission

From: ${name}
Email: ${email}

${message}
      `.trim(),
    })

    if (error) {
      console.error('Failed to send contact email:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: email,
      event: 'contact_form_submitted',
      properties: { subject },
    })
    await posthog.shutdown()

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
