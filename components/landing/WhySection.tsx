import { FeatureCard } from '@/components/landing/FeatureCard'
import { getSubscriptionEraPosts } from '@/lib/config/blog'

export function WhySection() {
  const posts = getSubscriptionEraPosts()

  if (posts.length === 0) return null

  return (
    <section className="container mx-auto py-10 sm:py-20 px-2 sm:px-4">
      <div className="mx-auto max-w-7xl space-y-8 sm:space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Everything is becoming a subscription
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mx-auto">
            Your streaming, your software, even stuff you were supposed to own. <br />
            The charges are small on their own which is why the total gets away from you.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-1 lg:grid-cols-3">
          {posts.map((post) => (
            <FeatureCard
              key={post.slug}
              title={post.landingTitle ?? post.title}
              description={post.landingBlurb ?? post.description}
              href={`/blog/${post.slug}`}
              openInNewTab
              source={post.source}
              sourceLogo={post.sourceLogo}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
