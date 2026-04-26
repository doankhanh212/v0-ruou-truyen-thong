import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const updates = {
  'ruou-nep-than-cuu-long-500ml': '/catalog/ruou-nep-poster.jpg',
  'ruou-nep-cai-hoa-vang-1l': '/catalog/ruou-nep-poster.jpg',
  'ruou-thuoc-minh-mang': '/catalog/minh-mang-tuu-bottle.jpg',
  'ruou-tay-duong-sam-tuu': '/catalog/tay-duong-sam-tuu-bottle.jpg',
  'ruou-man-500ml': '/catalog/hoang-hoa-tuu-bottle.jpg',
  'ruou-dau-tam': '/catalog/ruou-ba-kich-poster.jpg',
  'ruou-nep-than-1l': '/catalog/ruou-nep-poster.jpg',
  'combo-qua-tang-cao-cap': '/catalog/bo-qua-tang-cat-tuong-thinh-vuong.jpg',
  'ruou-dong-trung-ha-thao': '/catalog/hoang-hoa-tuu-poster.jpg',
  'combo-qua-tang-pho-thong': '/catalog/bo-qua-tang-loc-xuan.jpg',
}

for (const [slug, imageUrl] of Object.entries(updates)) {
  const r = await db.product.update({
    where: { slug },
    data: { imageUrl },
    select: { id: true, slug: true, imageUrl: true },
  }).catch((e) => {
    console.error(`skip ${slug}:`, e.message)
    return null
  })
  if (r) console.log(`ok ${r.slug} -> ${r.imageUrl}`)
}

await db.$disconnect()
