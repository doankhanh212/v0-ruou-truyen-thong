import { getCatalogItems, type CatalogItem } from '@/data/products'

/* ─── Intent types ──────────────────────────────── */

export type IntentId = 'gift' | 'health' | 'male' | 'daily' | 'unknown'
export type BudgetId = 'under-1m' | 'between-1m-2m' | 'over-2m' | 'unknown'
export type PreferenceId = 'premium' | 'easy' | 'traditional' | 'strength'

/* Legacy aliases used by option buttons */
export type PurposeId = IntentId
export type RecommendationItem = CatalogItem

/* ─── Option definitions ────────────────────────── */

interface PurposeOption {
  id: IntentId
  label: string
  categories: string[]
  tags: string[]
}

interface BudgetOption {
  id: Exclude<BudgetId, 'unknown'>
  label: string
  min: number
  max: number
}

interface PreferenceOption {
  id: PreferenceId
  label: string
  categories: string[]
  tags: string[]
}

export interface RecommendationAnswers {
  purposeId: IntentId
  budgetId: BudgetId
  preferenceId: PreferenceId
}

export const PURPOSE_OPTIONS: PurposeOption[] = [
  {
    id: 'gift',
    label: 'Mua làm quà',
    categories: ['quà tặng', 'bồi bổ', 'nhẹ'],
    tags: ['Cao cấp', 'Thơm nhẹ', '🎁 Cao cấp', '🎁 Doanh nghiệp', '🎁 Quà Tết', '🎁 Sum vầy'],
  },
  {
    id: 'health',
    label: 'Tăng sức khỏe',
    categories: ['bồi bổ', 'quà tặng'],
    tags: ['Cao cấp', '🎁 Cao cấp'],
  },
  {
    id: 'male',
    label: 'Nam giới',
    categories: ['sinh lý', 'entry'],
    tags: ['Sinh lực', 'Nhập môn'],
  },
  {
    id: 'daily',
    label: 'Dùng hằng ngày',
    categories: ['truyền thống', 'entry'],
    tags: ['Truyền thống', 'Nhập môn'],
  },
]

export const BUDGET_OPTIONS: BudgetOption[] = [
  { id: 'under-1m', label: 'Dưới 1 triệu', min: 0, max: 999999 },
  { id: 'between-1m-2m', label: 'Từ 1 đến 2 triệu', min: 1000000, max: 2000000 },
  { id: 'over-2m', label: 'Trên 2 triệu', min: 2000001, max: Number.POSITIVE_INFINITY },
]

export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  {
    id: 'premium',
    label: 'Cao cấp',
    categories: ['bồi bổ', 'quà tặng'],
    tags: ['Cao cấp', '🎁 Cao cấp', '🎁 Doanh nghiệp', '🎁 Quà Tết'],
  },
  {
    id: 'easy',
    label: 'Dễ uống',
    categories: ['nhẹ', 'entry'],
    tags: ['Thơm nhẹ', 'Nhập môn'],
  },
  {
    id: 'traditional',
    label: 'Truyền thống',
    categories: ['truyền thống'],
    tags: ['Truyền thống'],
  },
  {
    id: 'strength',
    label: 'Tăng sinh lực',
    categories: ['sinh lý', 'entry'],
    tags: ['Sinh lực'],
  },
]

/* ─── Text normalizer ───────────────────────────── */

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
}

/* ─── Intent / preference detection ─────────────── */

const INTENT_KEYWORDS: { intent: IntentId; keywords: string[] }[] = [
  {
    intent: 'gift',
    keywords: [
      'qua', 'bieu', 'tang', 'gift', 'lam qua', 'sep', 'doi tac', 'doanh nghiep',
      'tet', 'khach vip', 'khach hang', 'sum vay', 'cat tuong', 'thinh vuong',
      'loc xuan', 'hoang hoa',
    ],
  },
  {
    intent: 'health',
    keywords: [
      'suc khoe', 'boi bo', 'bo duong', 'duoc lieu', 'health', 'khoe',
      'tam bo', 'tay duong sam', 'sam', 'saffron', 'chong lao hoa',
    ],
  },
  {
    intent: 'male',
    keywords: [
      'nam', 'sinh ly', 'sinh luc', 'cuong', 'duong', 'trang duong',
      'cho nam', 'dan ong', 'ba kich', 'minh mang',
    ],
  },
  {
    intent: 'daily',
    keywords: [
      'hang ngay', 'truyen thong', 'de uong', 'nhe', 'binh dan', 'uong choi',
      'nhau', 'gian di', 're', 'gia re', 'ruou nep', 'gao nep',
    ],
  },
]

const PREFERENCE_KEYWORDS: { preference: PreferenceId; keywords: string[] }[] = [
  {
    preference: 'premium',
    keywords: ['cao cap', 'sang', 'vip', 'dep', 'xinh', 'hop qua', 'doi tac', 'tet'],
  },
  {
    preference: 'easy',
    keywords: ['de uong', 'nhe', 'thom', 'thanh'],
  },
  {
    preference: 'traditional',
    keywords: ['truyen thong', 'nep', 'co truyen', 'dan da'],
  },
  {
    preference: 'strength',
    keywords: ['sinh luc', 'manh', 'nam gioi', 'ba kich', 'minh mang'],
  },
]

const DIRECT_ITEM_KEYWORDS: Array<{ slug: string; keywords: string[] }> = [
  { slug: 'tay-duong-sam-tuu', keywords: ['tay duong sam', 'tay sam', 'sam my', 'tay duong sam tuu'] },
  { slug: 'minh-mang-tuu', keywords: ['minh mang', 'minh mang tuu'] },
  { slug: 'hoang-hoa-tuu', keywords: ['hoang hoa', 'hoang hoa tuu'] },
  { slug: 'ruou-ba-kich', keywords: ['ba kich', 'ruou ba kich'] },
  { slug: 'ruou-nep', keywords: ['ruou nep', 'nep 29', 'nep 39', 'gao nep'] },
  { slug: 'sum-vay', keywords: ['sum vay'] },
  { slug: 'thinh-vuong', keywords: ['thinh vuong'] },
  { slug: 'cat-tuong', keywords: ['cat tuong'] },
  { slug: 'loc-xuan', keywords: ['loc xuan'] },
]

export function detectIntent(input: string): IntentId {
  const text = normalize(input)
  let bestMatch: IntentId = 'unknown'
  let bestScore = 0

  for (const { intent, keywords } of INTENT_KEYWORDS) {
    let score = 0
    for (const keyword of keywords) {
      if (text.includes(keyword)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = intent
    }
  }

  return bestMatch
}

export function detectBudget(input: string): BudgetId {
  const text = normalize(input)

  if (text.includes('duoi 1') || text.includes('< 1') || text.includes('re') || text.includes('binh dan')) {
    return 'under-1m'
  }
  if (text.includes('tren 2') || text.includes('> 2') || text.includes('cao cap') || text.includes('dat')) {
    return 'over-2m'
  }
  if (text.includes('1 den 2') || text.includes('1-2') || text.includes('tu 1') || text.includes('tam')) {
    return 'between-1m-2m'
  }

  if (text.includes('trieu') || text.includes('tr')) {
    const millionMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr)/)
    if (millionMatch) {
      const value = Number.parseFloat(millionMatch[1].replace(',', '.')) * 1000000
      if (value <= 999999) return 'under-1m'
      if (value <= 2000000) return 'between-1m-2m'
      return 'over-2m'
    }
  }

  const numbers = text.match(/\d[\d.,]*/g)?.map((part) => Number.parseFloat(part.replace(/[.,]/g, ''))) ?? []

  if (numbers.length > 0) {
    const value = numbers[0]
    if (value >= 100000) {
      if (value <= 999999) return 'under-1m'
      if (value <= 2000000) return 'between-1m-2m'
      return 'over-2m'
    }
    if (value <= 1) return 'under-1m'
    if (value <= 2) return 'between-1m-2m'
    return 'over-2m'
  }

  return 'unknown'
}

export function detectPreference(input: string): PreferenceId | null {
  const text = normalize(input)

  for (const { preference, keywords } of PREFERENCE_KEYWORDS) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return preference
    }
  }

  return null
}

export function detectNamedSlugs(input: string): string[] {
  const text = normalize(input)

  return DIRECT_ITEM_KEYWORDS
    .filter((entry) => entry.keywords.some((keyword) => text.includes(keyword)))
    .map((entry) => entry.slug)
}

export function detectNamedItems(input: string): RecommendationItem[] {
  const slugs = detectNamedSlugs(input)
  if (slugs.length === 0) return []

  return getCatalogItems().filter((item) => slugs.includes(item.slug))
}

export function inferIntentFromQuery(input: string): IntentId {
  const directItems = detectNamedItems(input)
  const detectedIntent = detectIntent(input)

  if (directItems.length === 0) return detectedIntent

  if (directItems.some((item) => item.kind === 'gift-set' || item.category === 'quà tặng')) {
    return 'gift'
  }
  if (directItems.some((item) => item.category === 'bồi bổ')) {
    return 'health'
  }
  if (directItems.some((item) => item.category === 'sinh lý' || item.name.toLowerCase().includes('ba kích') || item.name.toLowerCase().includes('minh mạng'))) {
    return 'male'
  }
  if (directItems.some((item) => item.category === 'truyền thống' || item.name.toLowerCase().includes('rượu nếp'))) {
    return 'daily'
  }

  return detectedIntent
}

/* ─── Recommendation engine ─────────────────────── */

function getPurpose(id: IntentId) {
  return PURPOSE_OPTIONS.find((option) => option.id === id)
}

function getBudget(id: BudgetId) {
  return BUDGET_OPTIONS.find((option) => option.id === id)
}

function getPreference(id: PreferenceId) {
  return PREFERENCE_OPTIONS.find((option) => option.id === id)
}

function scoreCatalogItem(item: CatalogItem, answers: RecommendationAnswers, query?: string) {
  const purpose = getPurpose(answers.purposeId)
  const budget = getBudget(answers.budgetId)
  const preference = getPreference(answers.preferenceId)
  const itemTag = item.tag ?? ''
  const text = normalize([item.name, item.target, item.description ?? '', item.benefits.join(' '), itemTag].join(' '))
  const namedSlugs = query ? detectNamedSlugs(query) : []

  let score = 0

  if (budget) {
    const inBudget = item.priceMin >= budget.min && item.priceMin <= budget.max
    score += inBudget ? 4 : 0
  } else {
    score += 2
  }

  if (purpose) {
    if (purpose.categories.includes(item.category)) score += 5
    if (purpose.tags.includes(itemTag)) score += 4
  }

  if (preference) {
    if (preference.categories.includes(item.category)) score += 3
    if (preference.tags.includes(itemTag)) score += 4
  }

  if (answers.purposeId === 'gift' && item.kind === 'gift-set') score += 6
  if (answers.purposeId !== 'gift' && item.kind === 'product') score += 2
  if (answers.purposeId === 'health' && text.includes('boi bo')) score += 3
  if (answers.purposeId === 'male' && /minh mang|ba kich|sinh luc/.test(text)) score += 4
  if (answers.purposeId === 'daily' && /ruou nep|truyen thong|gia de/.test(text)) score += 4

  if (answers.preferenceId === 'premium' && item.kind === 'gift-set') score += 2
  if (answers.preferenceId === 'easy' && /de uong|thom|nhe/.test(text)) score += 2
  if (answers.preferenceId === 'traditional' && /truyen thong|nep/.test(text)) score += 2
  if (answers.preferenceId === 'strength' && /minh mang|ba kich|sinh luc/.test(text)) score += 2

  if (namedSlugs.includes(item.slug)) score += 12
  if (item.isBestSeller) score += 1

  return score
}

export interface MatchProductsInput {
  intent: IntentId
  budget?: BudgetId
  preference?: PreferenceId
  query?: string
}

/** Core recommendation: match products and gift sets by intent + optional budget/preference */
export function matchProducts(input: MatchProductsInput): RecommendationItem[] {
  const answers: RecommendationAnswers = {
    purposeId: input.intent,
    budgetId: input.budget ?? 'unknown',
    preferenceId: input.preference ?? 'easy',
  }

  const budget = getBudget(answers.budgetId)
  const catalog = getCatalogItems()
  const nameMatches = input.query ? detectNamedSlugs(input.query) : []
  let candidatePool = catalog

  if (nameMatches.length > 0) {
    const directMatches = catalog.filter((item) => nameMatches.includes(item.slug))
    if (directMatches.length >= 3) {
      candidatePool = directMatches
    }
  } else if (budget) {
    const budgetMatches = catalog.filter((item) => item.priceMin >= budget.min && item.priceMin <= budget.max)
    if (budgetMatches.length >= 3) candidatePool = budgetMatches
  }

  return [...candidatePool]
    .sort((left, right) => {
      const scoreDelta = scoreCatalogItem(right, answers, input.query) - scoreCatalogItem(left, answers, input.query)
      if (scoreDelta !== 0) return scoreDelta

      const nameDelta = Number(nameMatches.includes(right.slug)) - Number(nameMatches.includes(left.slug))
      if (nameDelta !== 0) return nameDelta

      const priceDelta = left.priceMin - right.priceMin
      if (priceDelta !== 0) return priceDelta

      return left.name.localeCompare(right.name)
    })
    .slice(0, 3)
}

/** Legacy function for step-based flow */
export function recommendProducts(answers: RecommendationAnswers): RecommendationItem[] {
  return matchProducts({
    intent: answers.purposeId,
    budget: answers.budgetId === 'unknown' ? undefined : answers.budgetId,
    preference: answers.preferenceId,
  })
}

/* ─── Legacy matchers for option-button fallback ── */

export function matchPurposeInput(input: string): PurposeId | null {
  const intent = detectIntent(input)
  return intent === 'unknown' ? null : intent
}

export function matchBudgetInput(input: string): Exclude<BudgetId, 'unknown'> | null {
  const budget = detectBudget(input)
  return budget === 'unknown' ? null : budget
}

export function matchPreferenceInput(input: string): PreferenceId | null {
  return detectPreference(input)
}
