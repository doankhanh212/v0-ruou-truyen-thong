import type { Metadata } from 'next'
import { Pricing } from '@/components/pricing'

export const metadata: Metadata = {
  title: 'Bảng Giá - Rượu Truyền Thống',
  description: 'Bảng giá rượu truyền thống cao cấp. Giá minh bạch, chất lượng đảm bảo. Liên hệ Zalo để nhận báo giá tốt nhất.',
}

export default function BangGiaPage() {
  return (
    <div className="bg-white">
      <Pricing />
    </div>
  )
}
