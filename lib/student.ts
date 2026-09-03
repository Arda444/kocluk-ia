export const STUDENT_NAME = "Ata Ata";

export function studentFirstName(displayName?: string | null) {
  const parts = (displayName?.trim() || STUDENT_NAME).split(/\s+/).filter(Boolean);
  return parts[0] ?? "Ata";
}
