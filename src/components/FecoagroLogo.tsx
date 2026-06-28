import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import logoImage from '@/assets/image-89a4f.png'

interface FecoagroLogoProps {
  className?: string
  linkTo?: string
  showOnDesktop?: boolean
}

export function FecoagroLogo({
  className,
  linkTo,
  showOnDesktop = true,
}: FecoagroLogoProps) {
  const logoContent = (
    <img
      src={logoImage}
      alt="Fecoagro"
      className={cn('h-10 w-auto object-contain', className)}
    />
  )

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className={cn('flex items-center', !showOnDesktop && 'md:hidden')}
        aria-label="Fecoagro - Ir para o início"
      >
        {logoContent}
      </Link>
    )
  }

  return <div className="flex items-center">{logoContent}</div>
}
