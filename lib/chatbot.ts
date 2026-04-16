interface ChatbotInput {
  purpose: string;
  budget?: number;
  preference?: string;
}

interface ChatbotRule {
  id: number;
  purpose: string;
  budgetMin: number | null;
  budgetMax: number | null;
  preference: string | null;
  recommendedProducts: number[];
  priority: number;
  isActive: boolean;
}

export function matchRule(input: ChatbotInput, rules: ChatbotRule[]): ChatbotRule | null {
  const activeRules = rules.filter((r) => r.isActive);
  if (activeRules.length === 0) return null;

  let bestRule: ChatbotRule | null = null;
  let bestScore = -1;

  for (const rule of activeRules) {
    let score = 0;

    // Purpose match: +3
    if (rule.purpose === "any" || rule.purpose === input.purpose) {
      score += 3;
    } else {
      continue; // purpose mismatch = skip entirely
    }

    // Budget match: +2
    if (input.budget) {
      const minOk = rule.budgetMin === null || input.budget >= rule.budgetMin;
      const maxOk = rule.budgetMax === null || input.budget <= rule.budgetMax;
      if (minOk && maxOk) {
        score += 2;
      }
    } else {
      // No budget provided — neutral (don't penalize)
      score += 1;
    }

    // Preference match: +1
    if (!rule.preference || rule.preference === "any" || rule.preference === input.preference) {
      score += 1;
    }

    // Tie-break by priority
    if (score > bestScore || (score === bestScore && bestRule && rule.priority > bestRule.priority)) {
      bestScore = score;
      bestRule = rule;
    }
  }

  return bestRule;
}
