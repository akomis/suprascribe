import { PublicContactForm } from '@/components/contact/PublicContactForm'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Suprascribe team. We read every message and respond to questions, feedback, and support requests.',
  alternates: {
    canonical: 'https://www.suprascribe.com/contact',
  },
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 dark:bg-neutral-900/80">
      <div className="flex gap-2 min-h-screen min-w-[350px] max-w-[700px] w-[90vw] sm:w-[600px] md:w-[900px] lg:w-[1000px] flex-col items-center justify-start mx-auto py-4 md:py-10 px-2 md:px-4 fade-on-mount">
        <div className="flex w-full items-center justify-between gap-2 md:gap-4">
          <SuprascribeLogo />
        </div>

        <div className="w-full max-w-[600px] mx-auto mt-8">
          <PublicContactForm
            title="Contact Us"
            description="Have a question, feedback, or just want to say hello? We'd love to hear from you!"
          />
        </div>
      </div>
    </div>
  )
}
