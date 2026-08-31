export const EXAM_TYPES = [
  { value: "LGS", label: "LGS — liseye hazırlık" },
  { value: "YKS", label: "YKS — üniversiteye hazırlık" },
] as const;

export const GRADES = [
  { value: "7", label: "7. sınıf" },
  { value: "8", label: "8. sınıf" },
  { value: "9", label: "9. sınıf" },
  { value: "10", label: "10. sınıf" },
  { value: "11", label: "11. sınıf" },
  { value: "12", label: "12. sınıf" },
  { value: "mezun", label: "Mezun" },
] as const;

export const TRACKS = [
  { value: "sayisal", label: "Sayısal" },
  { value: "sozel", label: "Sözel" },
  { value: "ea", label: "Eşit ağırlık" },
  { value: "dil", label: "Dil" },
] as const;

export type ExamType = (typeof EXAM_TYPES)[number]["value"];
export type Grade = (typeof GRADES)[number]["value"];
export type Track = (typeof TRACKS)[number]["value"];

export function examLabel(value: string) {
  return EXAM_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function gradeLabel(value: string) {
  return GRADES.find((item) => item.value === value)?.label ?? value;
}

export function trackLabel(value: string | null | undefined) {
  if (!value) return "alan belirtilmedi";
  return TRACKS.find((item) => item.value === value)?.label ?? value;
}
