import { ContactForm } from '@/components/dashboard/ContactForm'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 dark:bg-neutral-900/80">
      <div className="flex gap-2 min-h-screen min-w-[350px] max-w-[700px] w-[90vw] sm:w-[600px] md:w-[900px] lg:w-[1000px] flex-col items-center justify-start mx-auto py-4 md:py-10 px-2 md:px-4 fade-on-mount">
        <div className="flex w-full items-center justify-between gap-2 md:gap-4">
          <SuprascribeLogo />
        </div>

        <div className="w-full max-w-[600px] mx-auto mt-8">
          <ContactForm
            title="Contact Support"
            description="Have a question or need help? Send us a message and we'll get back to you soon."
          />
        </div>
      </div>
    </div>
  )
}
