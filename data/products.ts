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
  name: string
  category: string
  price: string // human-friendly range for display
  image: string
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
  name: string
  description: string
  image: string
  variants: GiftSetVariant[]
}

export interface GiftSetVariant {
  label: string
  volume: string
  priceBeforeVAT: number
  priceWithVAT: number
}

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export const products: Product[] = [
  {
    id: 'tay-duong-sam-tuu',
    name: 'Tây Dương Sâm Tửu',
    category: 'bồi bổ',
    price: '1.200.000 – 1.650.000',
    image: '/hero-liquor.jpg',
    description:
      'Tây dương sâm vị đắng hơi ngọt, tính hàn, có tác dụng hỗ trợ điều chỉnh rối loạn chuyển hóa mỡ, hạ đường huyết, ổn định huyết áp, tăng sức đề kháng, chống lão hóa. Là sự kết hợp hài hòa giữa Tây dương sâm, nhụy hoa nghệ tây (Saffron) cùng rượu truyền thống Cửu Long.',
    alcohol: '33% ACL.VOL',
    ingredients: ['Rượu truyền thống Cửu Long', 'Tây dương sâm', 'Nhụy hoa nghệ tây (Saffron)'],
    benefits: ['Tăng đề kháng', 'Ổn định huyết áp', 'Chống lão hóa', 'Hạ đường huyết'],
    target: 'Người trung niên, quà tặng cao cấp',
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
    name: 'Minh Mạng Tửu',
    category: 'sinh lý',
    price: '700.000 – 1.100.000',
    image: '/product-showcase.jpg',
    description:
      'Minh Mạng Tửu là sự kết hợp giữa rượu trắng truyền thống Cửu Long với Minh Mạng Thang thượng hạng — là tổng hợp các loại dược liệu quý của Việt Nam tạo nên bài thuốc vô cùng hữu hiệu trong việc duy trì sức khỏe.',
    alcohol: '29% ACL.VOL',
    ingredients: ['Rượu truyền thống Cửu Long', 'Minh Mạng Thang thượng hạng'],
    benefits: ['Tăng sinh lực', 'Bồi bổ nam giới', 'Duy trì sức khỏe'],
    target: 'Nam giới',
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
    name: 'Hoàng Hoa Tửu',
    category: 'nhẹ',
    price: '700.000 – 1.100.000',
    image: '/hero-liquor.jpg',
    description:
      'Hoàng Hoa Tửu được làm từ những hoa cúc vàng nhỏ ngâm với rượu Truyền Thống Cửu Long, kết hợp tuyệt vời của nhụy hoa nghệ tây (Saffron) giúp cho màu sắc và hương thơm dịu dàng như ướp mật, sự pha trộn giữa vị ngọt và đắng tạo nên hương vị thanh tao nhất.',
    alcohol: '29% ACL.VOL',
    ingredients: ['Rượu truyền thống Cửu Long', 'Hoa cúc khô', 'Nhụy hoa nghệ tây (Saffron)'],
    benefits: ['Dễ uống', 'Thơm nhẹ', 'Hương vị thanh tao'],
    target: 'Quà tặng, thưởng thức nhẹ nhàng',
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
    name: 'Rượu Ba Kích',
    category: 'entry',
    price: '350.000+',
    image: '/product-showcase.jpg',
    description:
      'Rượu Ba Kích — một sự kết hợp tinh tế giữa truyền thống và hiện đại mang đến một trải nghiệm thưởng thức rượu nhẹ nhàng hơn, dễ dàng hơn cho các bữa tiệc, nhưng vẫn giữ nguyên được nét đặc trưng của rượu truyền thống Việt Nam và hương vị độc đáo của ba kích rừng Quảng Ninh.',
    alcohol: '29% ACL.VOL',
    ingredients: ['Rượu truyền thống Cửu Long', 'Ba kích rừng Quảng Ninh'],
    benefits: ['Tăng sinh lý', 'Dễ uống', 'Phù hợp bữa tiệc'],
    target: 'Người mới, bữa tiệc',
    tag: 'Nhập môn',
    pricing: [
      { packaging: 'Hộp 1 chai', volume: '750ml', priceBeforeVAT: 350000, priceWithVAT: 385000 },
      { packaging: 'Hộp 2 chai', volume: '750ml', priceBeforeVAT: 700000, priceWithVAT: 770000 },
      { packaging: 'Thùng 6 chai', volume: '750ml', priceBeforeVAT: 2100000, priceWithVAT: 2310000 },
    ],
  },
  {
    id: 'ruou-nep',
    name: 'Rượu Nếp',
    category: 'truyền thống',
    price: '160.000+',
    image: '/hero-liquor.jpg',
    description:
      'Rượu nếp truyền thống Cửu Long là sự kết tinh tinh túy từ hạt gạo nếp vùng phù sa màu mỡ, mang đậm cốt cách và tâm hồn của người dân miền Tây sông nước. Được chưng cất theo phương pháp thủ công truyền thống, rượu gây ấn tượng bởi hương thơm nồng nàn, đặc trưng của nếp mới quyện cùng men thảo mộc tự nhiên.',
    alcohol: '29% & 39% ACL.VOL',
    ingredients: ['Gạo nếp vùng phù sa miền Tây', 'Men thảo mộc tự nhiên'],
    benefits: ['Hương nếp nguyên chất', 'Thủ công truyền thống', 'Giá tốt'],
    target: 'Dùng hàng ngày, nấu ăn, pha chế',
    tag: 'Truyền thống',
    pricing: [
      { packaging: 'Chai', volume: '500ml – 29°', priceBeforeVAT: 160000, priceWithVAT: 176000 },
      { packaging: 'Can', volume: '5000ml – 29°', priceBeforeVAT: 800000, priceWithVAT: 880000 },
      { packaging: 'Can', volume: '5000ml – 39°', priceBeforeVAT: 900000, priceWithVAT: 990000 },
    ],
  },
]

// ─────────────────────────────────────────────
// Gift Sets (Bộ Quà Tặng)
// ─────────────────────────────────────────────

export const giftSets: GiftSet[] = [
  {
    id: 'sum-vay',
    name: 'Bộ Quà Tặng Sum Vầy',
    description: 'Bình sứ Bát Tràng & 4 ly rượu — phù hợp biếu tặng sang trọng',
    image: '/hero-liquor.jpg',
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
    name: 'Bộ Quà Tặng Thịnh Vượng',
    description: 'Bình sứ Bát Tràng & 6 ly — thể hiện sự thịnh vượng và thành đạt',
    image: '/hero-liquor.jpg',
    variants: [
      { label: 'Minh Mạng + Hoàng Hoa', volume: '500ml', priceBeforeVAT: 1800000, priceWithVAT: 1880000 },
      { label: 'Minh Mạng + Tây Dương Sâm', volume: '500ml', priceBeforeVAT: 2300000, priceWithVAT: 2530000 },
      { label: 'Hoàng Hoa + Tây Dương Sâm', volume: '500ml', priceBeforeVAT: 2300000, priceWithVAT: 2530000 },
    ],
  },
  {
    id: 'cat-tuong',
    name: 'Bộ Quà Tặng Cát Tường',
    description: 'Bộ 3 chai cao cấp — Minh Mạng, Hoàng Hoa và Tây Dương Sâm — quà tặng đẳng cấp nhất',
    image: '/hero-liquor.jpg',
    variants: [
      { label: 'Bộ 3 (Minh Mạng + Hoàng Hoa + Tây Dương Sâm)', volume: '500ml', priceBeforeVAT: 2850000, priceWithVAT: 3135000 },
      { label: 'Bộ 3 (Minh Mạng + Hoàng Hoa + Tây Dương Sâm)', volume: '700ml', priceBeforeVAT: 3550000, priceWithVAT: 3905000 },
    ],
  },
  {
    id: 'loc-xuan',
    name: 'Bộ Quà Tặng Lộc Xuân',
    description: 'Bộ quà Tết sang trọng — phù hợp biếu đối tác, quà Tết doanh nghiệp',
    image: '/hero-liquor.jpg',
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
    address: 'Thửa đất số 147, tổ bản đồ số 49, Ấp Chánh Thuận, xã Cái Nhum, tỉnh Vĩnh Long',
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

export function formatPrice(value: number): string {
  return value.toLocaleString('vi-VN') + 'đ'
}

export function getStartingPrice(product: Product): number {
  return Math.min(...product.pricing.map((p) => p.priceBeforeVAT))
}

// ─────────────────────────────────────────────
// Catalog — products + gift sets unified for the /san-pham listing page
// ─────────────────────────────────────────────

export interface CatalogItem {
  id: string
  name: string
  category: string
  price: string    // display string, e.g. "1.200.000 – 1.650.000"
  priceMin: number // numeric min for filtering
  image: string
  benefits: string[]
  target: string
  tag?: string
  isBestSeller?: boolean
}

export function getCatalogItems(): CatalogItem[] {
  const productItems: CatalogItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    priceMin: getStartingPrice(p),
    image: p.image,
    benefits: p.benefits,
    target: p.target,
    tag: p.tag,
    isBestSeller: p.isBestSeller,
  }))

  const giftItems: CatalogItem[] = giftSets.map((g) => {
    const prices = g.variants.map((v) => v.priceBeforeVAT)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return {
      id: g.id,
      name: g.name,
      category: 'quà tặng',
      price: `${min.toLocaleString('vi-VN')} – ${max.toLocaleString('vi-VN')}`,
      priceMin: min,
      image: g.image,
      benefits: ['Sang trọng', 'Biếu tặng', 'Hộp quà cao cấp'],
      target: g.description,
      tag: '🎁 Quà tặng',
      isBestSeller: false,
    }
  })

  return [...productItems, ...giftItems]
}
