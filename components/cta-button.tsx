'use client'

import { cn } from '@/lib/utils'
import { openZalo } from '@/utils/zalo'

interface CTAButtonProps {
  label: string
  productName?: string
  className?: string
}

export function CTAButton({ label, productName, className = '' }: CTAButtonProps) {
  const handleClick = () => {
    const message = productName
      ? `Xin chào, tôi muốn tư vấn ${productName}`
      : 'Xin chào, tôi muốn tư vấn rượu'
    openZalo(undefined, message)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn('min-h-11 touch-manipulation', className)}
    >
      {label}
    </button>
  )
}
