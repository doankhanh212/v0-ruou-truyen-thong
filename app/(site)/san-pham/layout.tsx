import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { absoluteUrl, SITE_NAME } from '@/lib/seo'

const TITLE = `Tất cả sản phẩm — ${SITE_NAME}`
const DESCRIPTION = `Danh mục rượu truyền thống ${SITE_NAME} (Somo Gold). Rượu dược liệu, rượu nếp, rượu trái cây và bộ quà tặng cao cấp.`

export const metadata: Metadata = {
  title: 'Tất cả sản phẩm',
  description: DESCRIPTION,
  alternates: { canonical: '/san-pham' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/san-pham'),
    title: TITLE,
    description: DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function SanPhamLayout({ children }: { children: ReactNode }) {
  return children
}
