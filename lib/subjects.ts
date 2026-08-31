export const SUBJECTS = [
  "Matematik",
  "Geometri",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Türkçe",
  "Edebiyat",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Din",
  "İngilizce",
  "TYT Deneme",
  "AYT Deneme",
  "LGS Deneme",
] as const;

const COLORS: Record<string, string> = {
  Matematik: "bg-sky-400",
  Geometri: "bg-cyan-300",
  Fizik: "bg-violet-400",
  Kimya: "bg-fuchsia-400",
  Biyoloji: "bg-emerald-400",
  Türkçe: "bg-amber-300",
  Edebiyat: "bg-orange-300",
  Tarih: "bg-rose-400",
  Coğrafya: "bg-lime-400",
  Felsefe: "bg-indigo-300",
  Din: "bg-teal-300",
  İngilizce: "bg-blue-300",
  "TYT Deneme": "bg-accent",
  "AYT Deneme": "bg-coral",
  "LGS Deneme": "bg-accent",
};

export function subjectDot(subject: string) {
  return COLORS[subject] ?? "bg-white/40";
}
