'use client'

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
    <button type="button" onClick={handleClick} className={className}>
      {label}
    </button>
  )
}
