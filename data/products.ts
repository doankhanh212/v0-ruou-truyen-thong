// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface PricingOption {
  packaging: string
  volume: string
  priceBeforeVAT: number
  priceWithVAT: number
}

export interface Product {
  id: string
  slug: string
  name: string
  category: string
  price: string
  image: string
  detailImage?: string
  gallery?: string[]
  description: string
  alcohol: string
  ingredients: string[]
  benefits: string[]
  target: string
  pricing: PricingOption[]
  isBestSeller?: boolean
  tag?: string
}

export interface GiftSet {
  id: string
  slug: string
  name: string
  description: string
  image: string
  detailImage?: string
  gallery?: string[]
  benefits: string[]
  target: string
  tag?: string
  variants: GiftSetVariant[]
}

export interface GiftSetVariant {
  label: string
  volume: string
  priceBeforeVAT: number
  priceWithVAT: number
}

export interface BrandVisuals {
  hero: string
  collection: string
  gifts: string
  contact: string
  contactAlt: string
}

// ─────────────────────────────────────────────
// Shared brand visuals
// ─────────────────────────────────────────────

export const brandVisuals: BrandVisuals = {
  hero: '/catalog/ruou-truyen-thong-cover.jpg',
  collection: '/catalog/cuu-long-my-tuu-cover.jpg',
  gifts: '/catalog/qua-tang-cao-cap-cover.jpg',
  contact: '/catalog/contact-beige.jpg',
  contactAlt: '/catalog/bo-qua-tang-loc-xuan.jpg',
}

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export const products: Product[] = [
  {
    id: 'tay-duong-sam-tuu',
    slug: 'tay-duong-sam-tuu',
    name: 'Tây Dương Sâm Tửu',
    category: 'bồi bổ',
    price: '1.200.000 – 9.000.000',
    image: '/catalog/tay-duong-sam-tuu-bottle.jpg',
    detailImage: '/catalog/tay-duong-sam-tuu-poster.jpg',
    gallery: ['/catalog/tay-duong-sam-tuu-bottle.jpg', '/catalog/tay-duong-sam-tuu-poster.jpg'],
    description:
      'Tây dương sâm còn gọi là Tây sâm, Sâm Bắc Mỹ. Theo Đông y, vị đắng hơi ngọt, tính hàn, thường được dùng trong các bài thuốc cổ truyền. Somo Gold phối hợp Tây dương sâm, nhụy hoa nghệ tây cùng rượu truyền thống Cửu Long để tạo nên dòng quà biếu cao cấp, sang vị và khác biệt.',
    alcohol: '33% ACL.VOL',
    ingredients: ['Rượu truyền thống Cửu Long', 'Tây dương sâm', 'Nhụy hoa nghệ tây (Saffron)'],
    benefits: ['Dược liệu quý theo Đông y', 'Quà biếu cao cấp', 'Hương vị đặc trưng', 'Thiết kế sang trọng'],
    target: 'Người trung niên, biếu sếp, quà tặng cao cấp',
    isBestSeller: true,
    tag: 'Cao cấp',
    pricing: [
      { packaging: 'Bình sứ Bát Tràng', volume: '500ml', priceBeforeVAT: 1200000, priceWithVAT: 1320000 },
      { packaging: 'Bình sứ Bát Tràng', volume: '700ml', priceBeforeVAT: 1500000, priceWithVAT: 1650000 },
      { packaging: 'Hộp lục giác', volume: '500ml', priceBeforeVAT: 1300000, priceWithVAT: 1430000 },
      { packaging: 'Hộp lục giác', volume: '700ml', priceBeforeVAT: 1600000, priceWithVAT: 1760000 },
      { packaging: 'Túi nhung', volume: '500ml', priceBeforeVAT: 1350000, priceWithVAT: 1485000 },
      { packaging: 'Túi nhung', volume: '700ml', priceBeforeVAT: 1650000, priceWithVAT: 1815000 },
      { packaging: 'Thùng 6 chai', volume: '500ml', priceBeforeVAT: 7200000, priceWithVAT: 7920000 },
      { packaging: 'Thùng 6 chai', volume: '700ml', priceBeforeVAT: 9000000, priceWithVAT: 9900000 },
    ],
  },
  {
    id: 'minh-mang-tuu',
    slug: 'minh-mang-tuu',
    name: 'Minh Mạng Tửu',
    category: 'sinh lý',
    price: '700.000 – 5.400.000',
    image: '/catalog/minh-mang-tuu-bottle.jpg',
    detailImage: '/catalog/minh-mang-tuu-poster.jpg',
    gallery: ['/catalog/minh-mang-tuu-bottle.jpg', '/catalog/minh-mang-tuu-poster.jpg'],
    description:
      'Minh Mạng Tửu là sự kết hợp giữa rượu trắng truyền thống Cửu Long với Minh Mạng Thang thượng hạng, quy tụ nhiều dược liệu quý Việt Nam. Dòng này được chế tác theo bài thuốc cổ phương, phù hợp để dùng hoặc biếu tặng nhờ ngoại hình gốm sang trọng.',
    alcohol: '29% ACL.VOL',
    ingredients: ['Rượu truyền thống Cửu Long', 'Minh Mạng Thang thượng hạng'],
    benefits: ['Bài thuốc cổ phương', 'Nhiều dược liệu quý', 'Dùng biếu sang trọng', 'Nhiều quy cách đóng gói'],
    target: 'Nam giới, quà biếu gia đình, biếu đối tác',
    isBestSeller: true,
    tag: 'Sinh lực',
    pricing: [
      { packaging: 'Bình sứ Bát Tràng', volume: '500ml', priceBeforeVAT: 700000, priceWithVAT: 770000 },
      { packaging: 'Bình sứ Bát Tràng', volume: '700ml', priceBeforeVAT: 900000, priceWithVAT: 990000 },
      { packaging: 'Hộp lục giác', volume: '500ml', priceBeforeVAT: 800000, priceWithVAT: 880000 },
      { packaging: 'Hộp lục giác', volume: '700ml', priceBeforeVAT: 1000000, priceWithVAT: 1100000 },
      { packaging: 'Túi nhung', volume: '500ml', priceBeforeVAT: 850000, priceWithVAT: 935000 },
      { packaging: 'Túi nhung', volume: '700ml', priceBeforeVAT: 1050000, priceWithVAT: 1155000 },
      { packaging: 'Thùng 6 chai', volume: '500ml', priceBeforeVAT: 4200000, priceWithVAT: 4620000 },
      { packaging: 'Thùng 6 chai', volume: '700ml', priceBeforeVAT: 5400000, priceWithVAT: 5940000 },
    ],
  },
  {
    id: 'hoang-hoa-tuu',
    slug: 'hoang-hoa-tuu',
    name: 'Hoàng Hoa Tửu',
    category: 'nhẹ',
    price: '700.000 – 5.400.000',
    image: '/catalog/hoang-hoa-tuu-bottle.jpg',
    detailImage: '/catalog/hoang-hoa-tuu-poster.jpg',
    gallery: ['/catalog/hoang-hoa-tuu-bottle.jpg', '/catalog/hoang-hoa-tuu-poster.jpg'],
    description:
      'Hoàng Hoa Tửu được làm từ hoa cúc vàng nhỏ ngâm với rượu truyền thống Cửu Long, kết hợp cùng nhụy hoa nghệ tây để tạo màu sắc và hương thơm dịu dàng như ướp mật. Vị rượu thanh, dễ uống và phù hợp cho người thích thưởng thức nhẹ nhàng hoặc dùng làm quà biếu tinh tế.',
    alcohol: '29% ACL.VOL',
    ingredients: ['Rượu truyền thống Cửu Long', 'Hoa cúc khô', 'Nhụy hoa nghệ tây (Saffron)'],
    benefits: ['Dễ uống', 'Hương thơm dịu', 'Biếu tặng thanh lịch', 'Màu sắc đẹp mắt'],
    target: 'Người thích vị êm, quà biếu lịch sự, thưởng thức nhẹ nhàng',
    tag: 'Thơm nhẹ',
    pricing: [
      { packaging: 'Bình sứ Bát Tràng', volume: '500ml', priceBeforeVAT: 700000, priceWithVAT: 770000 },
      { packaging: 'Bình sứ Bát Tràng', volume: '700ml', priceBeforeVAT: 900000, priceWithVAT: 990000 },
      { packaging: 'Hộp lục giác', volume: '500ml', priceBeforeVAT: 800000, priceWithVAT: 880000 },
      { packaging: 'Hộp lục giác', volume: '700ml', priceBeforeVAT: 1000000, priceWithVAT: 1100000 },
      { packaging: 'Túi nhung', volume: '500ml', priceBeforeVAT: 850000, priceWithVAT: 935000 },
      { packaging: 'Túi nhung', volume: '700ml', priceBeforeVAT: 1050000, priceWithVAT: 1155000 },
      { packaging: 'Thùng 6 chai', volume: '500ml', priceBeforeVAT: 4200000, priceWithVAT: 4620000 },
      { packaging: 'Thùng 6 chai', volume: '700ml', priceBeforeVAT: 5400000, priceWithVAT: 5940000 },
    ],
  },
  {
    id: 'ruou-ba-kich',
    slug: 'ruou-ba-kich',
    name: 'Rượu Ba Kích',
    category: 'entry',
    price: '350.000 – 2.100.000',
    image: '/catalog/ruou-ba-kich-poster.jpg',
    detailImage: '/catalog/ruou-ba-kich-poster.jpg',
    gallery: ['/catalog/ruou-ba-kich-poster.jpg'],
    description:
      'Rượu Ba Kích là dòng kết hợp tinh tế giữa truyền thống và hiện đại, mang đến trải nghiệm thưởng thức nhẹ nhàng hơn, dễ tiếp cận hơn nhưng vẫn giữ nguyên nét đặc trưng của rượu Việt Nam. Đây là lựa chọn hợp lý cho người mới thử rượu dược liệu hoặc cần một món quà vừa túi tiền.',
    alcohol: '29% ACL.VOL',
    ingredients: ['Rượu truyền thống Cửu Long', 'Ba kích rừng Quảng Ninh'],
    benefits: ['Dễ tiếp cận', 'Giá tốt', 'Phù hợp tiệc nhẹ', 'Nam giới dễ chọn'],
    target: 'Người mới dùng, bữa tiệc, quà biếu dưới 1 triệu',
    tag: 'Nhập môn',
    pricing: [
      { packaging: 'Hộp 1 chai', volume: '750ml', priceBeforeVAT: 350000, priceWithVAT: 385000 },
      { packaging: 'Hộp 2 chai', volume: '750ml', priceBeforeVAT: 700000, priceWithVAT: 770000 },
      { packaging: 'Thùng 6 chai', volume: '750ml', priceBeforeVAT: 2100000, priceWithVAT: 2310000 },
    ],
  },
  {
    id: 'ruou-nep',
    slug: 'ruou-nep',
    name: 'Rượu Nếp',
    category: 'truyền thống',
    price: '160.000 – 900.000',
    image: '/catalog/ruou-nep-poster.jpg',
    detailImage: '/catalog/ruou-nep-poster.jpg',
    gallery: ['/catalog/ruou-nep-poster.jpg'],
    description:
      'Rượu nếp truyền thống Cửu Long là sự kết tinh tinh túy từ hạt gạo nếp vùng phù sa màu mỡ, mang đậm cốt cách miền Tây sông nước. Được chưng cất theo phương pháp thủ công truyền thống, rượu cho hương thơm nồng nàn của nếp mới và phù hợp với nhu cầu dùng hằng ngày, nấu ăn hoặc đãi tiệc bình dân.',
    alcohol: '29% & 39% ACL.VOL',
    ingredients: ['Gạo nếp vùng phù sa miền Tây', 'Men thảo mộc tự nhiên'],
    benefits: ['Truyền thống chuẩn vị', 'Giá dễ tiếp cận', 'Dùng hằng ngày', 'Có can 5 lít tiện lợi'],
    target: 'Dùng hằng ngày, quán ăn, nấu ăn, pha chế',
    tag: 'Truyền thống',
    pricing: [
      { packaging: 'Chai', volume: '500ml – 29% ALC', priceBeforeVAT: 160000, priceWithVAT: 176000 },
      { packaging: 'Can', volume: '5000ml – 29% ALC', priceBeforeVAT: 800000, priceWithVAT: 880000 },
      { packaging: 'Can', volume: '5000ml – 39% ALC', priceBeforeVAT: 900000, priceWithVAT: 990000 },
    ],
  },
]

// ─────────────────────────────────────────────
// Gift Sets (Bộ Quà Tặng)
// ─────────────────────────────────────────────

export const giftSets: GiftSet[] = [
  {
    id: 'sum-vay',
    slug: 'sum-vay',
    name: 'Bộ Quà Tặng Sum Vầy',
    description: 'Bình sứ Bát Tràng kèm 4 ly hoặc phối 2 chai trong hộp lục giác, phù hợp biếu gia đình và người thân.',
    image: '/catalog/bo-qua-tang-sum-vay.jpg',
    detailImage: '/catalog/bo-qua-tang-sum-vay.jpg',
    gallery: ['/catalog/bo-qua-tang-sum-vay.jpg', '/catalog/qua-tang-cao-cap-cover.jpg'],
    benefits: ['Bình Bát Tràng kèm ly rượu', 'Phù hợp quà gia đình', 'Nhiều cấu hình 1 chai và 2 chai'],
    target: 'Biếu gia đình, người thân, quà sum họp',
    tag: '🎁 Sum vầy',
    variants: [
      { label: 'Minh Mạng Tửu', volume: '500ml', priceBeforeVAT: 1000000, priceWithVAT: 1100000 },
      { label: 'Minh Mạng Tửu', volume: '700ml', priceBeforeVAT: 1200000, priceWithVAT: 1320000 },
      { label: 'Hoàng Hoa Tửu', volume: '500ml', priceBeforeVAT: 1000000, priceWithVAT: 1100000 },
      { label: 'Hoàng Hoa Tửu', volume: '700ml', priceBeforeVAT: 1200000, priceWithVAT: 1320000 },
      { label: 'Tây Dương Sâm Tửu', volume: '500ml', priceBeforeVAT: 1500000, priceWithVAT: 1650000 },
      { label: 'Tây Dương Sâm Tửu', volume: '700ml', priceBeforeVAT: 1800000, priceWithVAT: 1980000 },
      { label: 'Minh Mạng + Hoàng Hoa (Bình Bát Tràng)', volume: '500ml', priceBeforeVAT: 1600000, priceWithVAT: 1760000 },
      { label: 'Minh Mạng + Tây Dương Sâm (Bình Bát Tràng)', volume: '500ml', priceBeforeVAT: 2100000, priceWithVAT: 2310000 },
      { label: 'Hoàng Hoa + Tây Dương Sâm (Bình Bát Tràng)', volume: '500ml', priceBeforeVAT: 2100000, priceWithVAT: 2310000 },
    ],
  },
  {
    id: 'thinh-vuong',
    slug: 'thinh-vuong',
    name: 'Bộ Quà Tặng Thịnh Vượng',
    description: 'Hộp quà mở cao cấp với 2 chai và 6 ly, phù hợp biếu đối tác hoặc quà doanh nghiệp sang trọng.',
    image: '/catalog/qua-tang-cao-cap-cover.jpg',
    detailImage: '/catalog/bo-qua-tang-cat-tuong-thinh-vuong.jpg',
    gallery: ['/catalog/qua-tang-cao-cap-cover.jpg', '/catalog/bo-qua-tang-cat-tuong-thinh-vuong.jpg'],
    benefits: ['Kèm 6 ly thủy tinh', 'Biếu sếp hoặc đối tác', 'Thiết kế mở hộp ấn tượng'],
    target: 'Quà doanh nghiệp, đối tác, lãnh đạo',
    tag: '🎁 Doanh nghiệp',
    variants: [
      { label: 'Minh Mạng + Hoàng Hoa', volume: '500ml', priceBeforeVAT: 1800000, priceWithVAT: 1880000 },
      { label: 'Minh Mạng + Tây Dương Sâm', volume: '500ml', priceBeforeVAT: 2300000, priceWithVAT: 2530000 },
      { label: 'Hoàng Hoa + Tây Dương Sâm', volume: '500ml', priceBeforeVAT: 2300000, priceWithVAT: 2530000 },
    ],
  },
  {
    id: 'cat-tuong',
    slug: 'cat-tuong',
    name: 'Bộ Quà Tặng Cát Tường',
    description: 'Bộ 3 chai cao cấp gồm Minh Mạng, Hoàng Hoa và Tây Dương Sâm cho nhu cầu biếu tặng đẳng cấp.',
    image: '/catalog/qua-tang-cao-cap-cover.jpg',
    detailImage: '/catalog/bo-qua-tang-cat-tuong-thinh-vuong.jpg',
    gallery: ['/catalog/qua-tang-cao-cap-cover.jpg', '/catalog/bo-qua-tang-cat-tuong-thinh-vuong.jpg'],
    benefits: ['Bộ 3 chai premium', 'Quà biếu nổi bật', 'Phù hợp dịp lễ Tết và sự kiện'],
    target: 'Biếu lãnh đạo, khách VIP, quà Tết cao cấp',
    tag: '🎁 Cao cấp',
    variants: [
      { label: 'Bộ 3 (Minh Mạng + Hoàng Hoa + Tây Dương Sâm)', volume: '500ml', priceBeforeVAT: 2850000, priceWithVAT: 3135000 },
      { label: 'Bộ 3 (Minh Mạng + Hoàng Hoa + Tây Dương Sâm)', volume: '700ml', priceBeforeVAT: 3550000, priceWithVAT: 3905000 },
    ],
  },
  {
    id: 'loc-xuan',
    slug: 'loc-xuan',
    name: 'Bộ Quà Tặng Lộc Xuân',
    description: 'Hộp quà Tết mở cánh sang trọng, phối sẵn 3 combo để biếu đối tác hoặc khách hàng dịp đầu năm.',
    image: '/catalog/bo-qua-tang-loc-xuan.jpg',
    detailImage: '/catalog/bo-qua-tang-loc-xuan.jpg',
    gallery: ['/catalog/bo-qua-tang-loc-xuan.jpg', '/catalog/contact-blue-loc-xuan.jpg'],
    benefits: ['Thiết kế quà Tết nổi bật', '3 phối vị bán sẵn', 'Rất hợp quà doanh nghiệp'],
    target: 'Quà Tết doanh nghiệp, biếu khách hàng, biếu đối tác',
    tag: '🎁 Quà Tết',
    variants: [
      { label: 'Minh Mạng + Hoàng Hoa', volume: '500ml', priceBeforeVAT: 1700000, priceWithVAT: 1870000 },
      { label: 'Minh Mạng + Hoàng Hoa', volume: '700ml', priceBeforeVAT: 2100000, priceWithVAT: 2310000 },
      { label: 'Tây Dương Sâm + Hoàng Hoa', volume: '500ml', priceBeforeVAT: 2200000, priceWithVAT: 2420000 },
      { label: 'Tây Dương Sâm + Hoàng Hoa', volume: '700ml', priceBeforeVAT: 2700000, priceWithVAT: 2970000 },
      { label: 'Tây Dương Sâm + Minh Mạng', volume: '500ml', priceBeforeVAT: 2200000, priceWithVAT: 2420000 },
      { label: 'Tây Dương Sâm + Minh Mạng', volume: '700ml', priceBeforeVAT: 2700000, priceWithVAT: 2970000 },
    ],
  },
]

// ─────────────────────────────────────────────
// Company Info
// ─────────────────────────────────────────────

export const companyInfo = {
  name: 'Công Ty Cổ Phần Somo Gold',
  brand: 'Cửu Long Mỹ Tửu',
  phone: ['0909 799 311', '0902 931 119'],
  email: 'somogold@somogroup.vn',
  address: '29 Nguyễn Khắc Nhu, P. Cầu Ông Lãnh, TP. Hồ Chí Minh',
  factory: {
    name: 'Công Ty Cổ Phần Somo Farm Cửu Long',
    address: 'Thửa đất số 147, tờ bản đồ số 49, Ấp Chánh Thuận, xã Cái Nhum, tỉnh Vĩnh Long',
  },
  distributor: {
    name: 'Công Ty CP Kinh Doanh Thủy Hải Sản Sài Gòn (APT)',
    address: 'Lô 4-6-8 đường số 1A, KCN Tân Tạo, P. Tân Tạo, TP. Hồ Chí Minh',
  },
  certifications: ['ISO 22000:2018', 'Best Choice', 'OCOP 4 sao'],
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function getGiftSetById(id: string): GiftSet | undefined {
  return giftSets.find((giftSet) => giftSet.id === id)
}

export function getGiftSetBySlug(slug: string): GiftSet | undefined {
  return giftSets.find((giftSet) => giftSet.slug === slug)
}

export function formatPrice(value: number): string {
  return value.toLocaleString('vi-VN') + 'đ'
}

export function getStartingPrice(product: Product): number {
  return Math.min(...product.pricing.map((p) => p.priceBeforeVAT))
}

export function getGiftSetStartingPrice(giftSet: GiftSet): number {
  return Math.min(...giftSet.variants.map((variant) => variant.priceBeforeVAT))
}

// ─────────────────────────────────────────────
// Catalog — products + gift sets unified for the /san-pham listing page
// ─────────────────────────────────────────────

export interface CatalogItem {
  id: string
  slug: string
  kind: 'product' | 'gift-set'
  name: string
  category: string
  price: string
  priceMin: number
  image: string
  detailImage?: string
  gallery?: string[]
  description?: string
  benefits: string[]
  target: string
  tag?: string
  isBestSeller?: boolean
}

export function getCatalogItems(): CatalogItem[] {
  const productItems: CatalogItem[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    kind: 'product',
    name: product.name,
    category: product.category,
    price: product.price,
    priceMin: getStartingPrice(product),
    image: product.image,
    detailImage: product.detailImage,
    gallery: product.gallery,
    description: product.description,
    benefits: product.benefits,
    target: product.target,
    tag: product.tag,
    isBestSeller: product.isBestSeller,
  }))

  const giftItems: CatalogItem[] = giftSets.map((giftSet) => {
    const prices = giftSet.variants.map((variant) => variant.priceBeforeVAT)
    const min = Math.min(...prices)
    const max = Math.max(...prices)

    return {
      id: giftSet.id,
      slug: giftSet.slug,
      kind: 'gift-set',
      name: giftSet.name,
      category: 'quà tặng',
      price: `${min.toLocaleString('vi-VN')} – ${max.toLocaleString('vi-VN')}`,
      priceMin: min,
      image: giftSet.image,
      detailImage: giftSet.detailImage,
      gallery: giftSet.gallery,
      description: giftSet.description,
      benefits: giftSet.benefits,
      target: giftSet.target,
      tag: giftSet.tag,
      isBestSeller: giftSet.id === 'loc-xuan',
    }
  })

  return [...productItems, ...giftItems]
}
