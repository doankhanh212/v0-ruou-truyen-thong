import Image from 'next/image'
import { cn } from '@/lib/utils'

const LOGO_SRC = '/android-chrome-512x512.png'

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  priority?: boolean
  sizes?: string
}

export function BrandLogo({
  className,
  imageClassName,
  priority = false,
  sizes = '40px',
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        'relative block shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-black/5',
        className
      )}
    >
      <Image
        src={LOGO_SRC}
        alt="Ruou Truyen Thong"
        fill
        priority={priority}
        sizes={sizes}
        className={cn('object-cover', imageClassName)}
      />
    </span>
  )
}
