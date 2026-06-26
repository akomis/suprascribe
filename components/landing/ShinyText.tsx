interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
  color?: string
  shineColor?: string
  spread?: number
  yoyo?: boolean
  direction?: 'left' | 'right'
  delay?: number
}

export function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  yoyo = false,
  direction = 'left',
  delay = 0,
}: ShinyTextProps) {
  const animationDirection = yoyo
    ? direction === 'left'
      ? 'alternate'
      : 'alternate-reverse'
    : direction === 'left'
      ? 'normal'
      : 'reverse'

  return (
    <span
      className={`inline-block ${className}`}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, var(--shiny-text-color, ${color}) 0%, var(--shiny-text-color, ${color}) 35%, ${shineColor} 50%, var(--shiny-text-color, ${color}) 65%, var(--shiny-text-color, ${color}) 100%)`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundPosition: '150% center',
        ...(disabled
          ? {}
          : {
              animation: `shiny-text ${speed}s linear ${delay}s infinite ${animationDirection}`,
            }),
      }}
    >
      {text}
    </span>
  )
}
