import type { Metadata } from 'next'
import { Story } from '@/components/story'
import { SocialProof } from '@/components/social-proof'

export const metadata: Metadata = {
  title: 'Giới Thiệu - Rượu Truyền Thống',
  description: 'Câu chuyện rượu truyền thống — kế thừa bí quyết chế tác rượu thuốc truyền thống từ đời xưa của người dân miền Nam Việt Nam.',
}

export default function GioiThieuPage() {
  return (
    <div className="bg-white">
      <Story />
      <SocialProof />
    </div>
  )
}
