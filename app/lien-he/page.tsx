import type { Metadata } from 'next'
import { Contact } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Liên Hệ - Rượu Truyền Thống',
  description: 'Liên hệ mua rượu truyền thống. Hotline, Zalo, email — tư vấn miễn phí, giao hàng toàn quốc.',
}

export default function LienHePage() {
  return (
    <div className="bg-white">
      <Contact />
    </div>
  )
}
