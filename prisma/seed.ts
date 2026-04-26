import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // --- Products ---
  const products = [
    {
      name: "Rượu Nếp Than Cửu Long 500ml",
      slug: "ruou-nep-than-cuu-long-500ml",
      price: 150000,
      priceOld: 180000,
      category: "ruou-nep",
      description: "Rượu nếp than truyền thống, hương vị đậm đà, thơm nồng đặc trưng vùng sông nước Cửu Long.",
      imageUrl: "/catalog/ruou-nep-poster.jpg",
      tags: ["biếu", "đặc sản"],
      inStock: true,
      featured: true,
      sortOrder: 1,
      volume: "500ml",
      alcohol: 38.5,
      origin: "Sóc Trăng",
    },
    {
      name: "Rượu Nếp Cái Hoa Vàng 1L",
      slug: "ruou-nep-cai-hoa-vang-1l",
      price: 250000,
      priceOld: 300000,
      category: "ruou-nep",
      description: "Rượu nếp cái hoa vàng thượng hạng, vị ngọt êm, dễ uống.",
      imageUrl: "/catalog/ruou-nep-poster.jpg",
      tags: ["uống", "đặc sản"],
      inStock: true,
      featured: true,
      sortOrder: 2,
      volume: "1L",
      alcohol: 35.0,
      origin: "Cần Thơ",
    },
    {
      name: "Rượu Thuốc Minh Mạng",
      slug: "ruou-thuoc-minh-mang",
      price: 700000,
      priceOld: 850000,
      category: "ruou-thuoc",
      description: "Minh Mạng Tửu kết hợp rượu truyền thống với dược liệu quý, chế tác theo bài thuốc cổ phương.",
      imageUrl: "/catalog/minh-mang-tuu-bottle.jpg",
      tags: ["sức khỏe", "biếu"],
      inStock: true,
      featured: true,
      sortOrder: 3,
      volume: "500ml",
      alcohol: 33.0,
      origin: "Sóc Trăng",
    },
    {
      name: "Rượu Tây Dương Sâm Tửu",
      slug: "ruou-tay-duong-sam-tuu",
      price: 1200000,
      priceOld: 1500000,
      category: "ruou-thuoc",
      description: "Tây dương sâm kết hợp nhụy hoa nghệ tây, dược liệu quý trong Đông y.",
      imageUrl: "/catalog/tay-duong-sam-tuu-bottle.jpg",
      tags: ["cao cấp", "sức khỏe", "biếu"],
      inStock: true,
      featured: true,
      sortOrder: 4,
      volume: "500ml",
      alcohol: 33.0,
      origin: "Sóc Trăng",
    },
    {
      name: "Rượu Mận 500ml",
      slug: "ruou-man-500ml",
      price: 120000,
      category: "ruou-trai-cay",
      description: "Rượu mận ngọt dịu, thích hợp cho phái nữ và những ai thích vị nhẹ.",
      imageUrl: "/catalog/hoang-hoa-tuu-bottle.jpg",
      tags: ["nhẹ", "trái cây"],
      inStock: true,
      featured: false,
      sortOrder: 5,
      volume: "500ml",
      alcohol: 15.0,
      origin: "Cần Thơ",
    },
    {
      name: "Rượu Dâu Tằm",
      slug: "ruou-dau-tam",
      price: 130000,
      category: "ruou-trai-cay",
      description: "Rượu dâu tằm đỏ thẫm, vị chua ngọt tự nhiên, bổ dưỡng.",
      imageUrl: "/catalog/ruou-ba-kich-poster.jpg",
      tags: ["nhẹ", "sức khỏe", "trái cây"],
      inStock: true,
      featured: false,
      sortOrder: 6,
      volume: "500ml",
      alcohol: 14.0,
      origin: "Cần Thơ",
    },
    {
      name: "Rượu Nếp Than 1L",
      slug: "ruou-nep-than-1l",
      price: 280000,
      priceOld: 320000,
      category: "ruou-nep",
      description: "Phiên bản 1 lít của rượu nếp than truyền thống.",
      imageUrl: "/catalog/ruou-nep-poster.jpg",
      tags: ["đặc sản", "uống"],
      inStock: true,
      featured: false,
      sortOrder: 7,
      volume: "1L",
      alcohol: 38.5,
      origin: "Sóc Trăng",
    },
    {
      name: "Combo Quà Tặng Cao Cấp",
      slug: "combo-qua-tang-cao-cap",
      price: 2500000,
      priceOld: 3000000,
      category: "qua-tang",
      description: "Hộp quà sang trọng gồm Tây Dương Sâm Tửu + Minh Mạng Tửu, phù hợp biếu tặng.",
      imageUrl: "/catalog/bo-qua-tang-cat-tuong-thinh-vuong.jpg",
      tags: ["biếu", "cao cấp", "combo"],
      inStock: true,
      featured: true,
      sortOrder: 8,
      volume: "combo",
      alcohol: null,
      origin: "Sóc Trăng",
    },
    {
      name: "Rượu Đông Trùng Hạ Thảo",
      slug: "ruou-dong-trung-ha-thao",
      price: 1800000,
      category: "ruou-thuoc",
      description: "Rượu ngâm đông trùng hạ thảo quý hiếm, dược liệu nổi tiếng trong Đông y.",
      imageUrl: "/catalog/hoang-hoa-tuu-poster.jpg",
      tags: ["cao cấp", "sức khỏe"],
      inStock: true,
      featured: false,
      sortOrder: 9,
      volume: "500ml",
      alcohol: 35.0,
      origin: "Sóc Trăng",
    },
    {
      name: "Combo Quà Tặng Phổ Thông",
      slug: "combo-qua-tang-pho-thong",
      price: 500000,
      priceOld: 600000,
      category: "qua-tang",
      description: "Hộp quà phổ thông gồm 2 chai rượu nếp, túi xách đẹp.",
      imageUrl: "/catalog/bo-qua-tang-loc-xuan.jpg",
      tags: ["biếu", "combo"],
      inStock: true,
      featured: false,
      sortOrder: 10,
      volume: "combo",
      alcohol: null,
      origin: "Sóc Trăng",
    },
  ];

  // Resolve category FK from slug
  const categorySlugs = [...new Set(products.map((p) => p.category))];
  for (const slug of categorySlugs) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        isActive: true,
        isDeleted: false,
      },
    });
  }
  const categoryRows = await prisma.category.findMany({
    where: { slug: { in: categorySlugs } },
    select: { id: true, slug: true },
  });
  const categoryBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  for (const p of products) {
    const categoryId = categoryBySlug.get(p.category);
    if (!categoryId) {
      console.warn(`[seed] skipping ${p.slug} - no category ${p.category}`);
      continue;
    }
    const { category: _legacySlug, ...rest } = p;
    const data = { ...rest, category: _legacySlug, categoryId };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
  }
  console.log(`Seeded ${products.length} products`);

  // --- Chatbot Rules ---
  const rules = [
    {
      id: 1,
      purpose: "bieu",
      budgetMin: 1000000,
      budgetMax: null,
      preference: "any",
      recommendedProducts: [4, 8], // Tây Dương Sâm, Combo Cao Cấp
      note: "Khách biếu ngân sách cao → sản phẩm cao cấp",
      priority: 10,
      isActive: true,
    },
    {
      id: 2,
      purpose: "bieu",
      budgetMin: null,
      budgetMax: 1000000,
      preference: "any",
      recommendedProducts: [1, 10], // Nếp Than 500ml, Combo Phổ Thông
      note: "Khách biếu ngân sách vừa → sản phẩm phổ thông",
      priority: 9,
      isActive: true,
    },
    {
      id: 3,
      purpose: "suc-khoe",
      budgetMin: null,
      budgetMax: null,
      preference: "any",
      recommendedProducts: [3, 4, 9], // Minh Mạng, Tây Dương Sâm, Đông Trùng
      note: "Khách mua vì sức khỏe → rượu thuốc",
      priority: 8,
      isActive: true,
    },
  ];

  for (const r of rules) {
    await prisma.chatbotRule.upsert({
      where: { id: r.id },
      update: r,
      create: r,
    });
  }
  console.log(`Seeded ${rules.length} chatbot rules`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
