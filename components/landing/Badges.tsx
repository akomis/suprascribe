export function Badges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <a
        href="https://www.producthunt.com/products/suprascribe/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-suprascribe"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1204836&theme=dark"
          alt="Suprascribe - Scan your email to find and manage every recurring payment. | Product Hunt"
          style={{ width: '231px', height: '50px' }}
          width="231"
          height="50"
        />
      </a>
      <a
        href="https://openalternative.co/suprascribe?utm_source=openalternative&utm_medium=badge&utm_campaign=embed&utm_content=tool-suprascribe"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://openalternative.co/suprascribe/badge.svg?theme=dark&width=200&height=50"
          width="200"
          height="50"
          alt="Suprascribe badge"
          loading="lazy"
        />
      </a>
    </div>
  )
}
