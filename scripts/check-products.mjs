import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const rows = await db.product.findMany({ select: { id: true, slug: true, imageUrl: true, name: true }, orderBy: { sortOrder: 'asc' }, take: 10 })
console.log(JSON.stringify(rows, null, 2))
await db.$disconnect()
