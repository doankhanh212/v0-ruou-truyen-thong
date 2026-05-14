const ALCOHOL_COMPLIANCE_KEYWORDS = ["suc khoe", "tri benh", "bo duong", "y te"];

export function normalizeVietnameseForCompliance(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "d")
    .toLowerCase();
}

export function isAlcoholComplianceForbidden(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = normalizeVietnameseForCompliance(value);
  return ALCOHOL_COMPLIANCE_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function filterAlcoholComplianceTerms(items: string[]): string[] {
  return items.filter((item) => !isAlcoholComplianceForbidden(item));
}
