import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const FECOAGRO_LOGO_URL =
  'https://www.fecoagro.coop.br/wp-content/uploads/2021/10/logo-top.png'

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
  const [imgError, setImgError] = useState(false)

  const logoContent = imgError ? (
    <span
      className={cn('text-2xl font-bold tracking-tight', className)}
      style={{ color: 'hsl(var(--primary))' }}
    >
      Fecoagro
    </span>
  ) : (
    <img
      src={FECOAGRO_LOGO_URL}
      alt="Fecoagro"
      onError={() => setImgError(true)}
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
