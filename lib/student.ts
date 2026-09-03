export const STUDENT_NAME = "Ata Ata";
export const STUDENT_FIRST_NAME = "Ata";

const NAMED_PLACEHOLDERS = new Set(["", "öğrenci", "e2e", "e2e öğrenci"]);

export function isPlaceholderName(name?: string | null) {
  const value = name?.trim() ?? "";
  if (!value) return true;
  const lower = value.toLocaleLowerCase("tr-TR");
  if (NAMED_PLACEHOLDERS.has(lower)) return true;
  return /\be2e\b/i.test(value);
}

export function studentDisplayName(displayName?: string | null) {
  return isPlaceholderName(displayName) ? STUDENT_NAME : displayName!.trim();
}

export function studentFirstName(displayName?: string | null) {
  const parts = studentDisplayName(displayName).split(/\s+/).filter(Boolean);
  return parts[0] ?? STUDENT_FIRST_NAME;
}

export function rewritePlaceholderText(text: string) {
  return text.replaceAll("E2E Öğrenci", STUDENT_NAME).replace(/\bE2E\b/g, STUDENT_FIRST_NAME);
}
