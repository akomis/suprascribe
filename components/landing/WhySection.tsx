import { FeatureCard } from '@/components/landing/FeatureCard'
import { getSubscriptionEraPosts } from '@/lib/config/blog'

export function WhySection() {
  const posts = getSubscriptionEraPosts()

  if (posts.length === 0) return null

  return (
    <section className="container mx-auto py-10 sm:py-20 px-2 sm:px-4">
      <div className="mx-auto max-w-7xl space-y-8 sm:space-y-12">
        <div className="text-center space-y-3 lg:text-left lg:grid lg:grid-cols-3 lg:items-center lg:space-y-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl lg:col-span-1 font-bold tracking-tight text-balance">
            Everything is becoming a subscription
          </h2>
          <p className="lg:col-span-2 text-center lg:text-right text-base xl:text-lg text-muted-foreground mx-auto lg:mx-0">
            Your entertainment, your tools, even stuff you used to buy outright.
            <br className="hidden lg:inline" /> The charges are usually small on their own and
            silently changing,
            <br className="hidden lg:inline" />
            which is why the total gets away from you.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
          {posts.map((post) => (
            <FeatureCard
              key={post.slug}
              title={post.landingTitle ?? post.title}
              description={post.landingBlurb ?? post.description}
              href={`/blog/${post.slug}`}
              source={post.source}
              sourceLogo={post.sourceLogo}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
