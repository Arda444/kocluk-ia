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

export const PLATFORMS = [
  {
    value: "youtube",
    label: "YouTube",
    hint: "Ücretsiz video, kendi programın",
  },
  {
    value: "doping",
    label: "Doping Hafıza",
    hint: "Video + kamp + uygulama",
  },
  {
    value: "kaynak345",
    label: "345 / All Star",
    hint: "Soru bankası ve deneme — tek kaynak",
  },
  {
    value: "raunt",
    label: "Raunt",
    hint: "Canlı ders ve online koçluk",
  },
  {
    value: "other",
    label: "Diğer",
    hint: "Kendi kaynağını yaz",
  },
] as const;

export type ExamType = (typeof EXAM_TYPES)[number]["value"];
export type Grade = (typeof GRADES)[number]["value"];
export type Track = (typeof TRACKS)[number]["value"];
export type Platform = (typeof PLATFORMS)[number]["value"];

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

export function normalizePlatform(value: string | null | undefined) {
  if (value === "allstar" || value === "yayin345") return "kaynak345";
  return value || "youtube";
}

export function platformLabel(value: string | null | undefined) {
  const key = normalizePlatform(value);
  return PLATFORMS.find((item) => item.value === key)?.label ?? key;
}

export const PLATFORM_PLAYBOOK: Record<string, string> = {
  youtube: `YouTube ile hazırlanıyor. Yönlendirme kuralları:
- Kanalları dağınık izletme. Her ders için 1 ana + 1 soru kanalı öner, sonra o disipline kilitle.
- TYT/LGS: Tonguç Akademi, Kenan Kara, Rüştü Hoca Hoca, Özcan Aykın, Limit yok / 345 ipuçları gibi kanallar bağlamına göre; AYT sayısalda daha derin hocalara yönlendir.
- "Playlist bitir" değil: konu videosu (max 20-30 dk) → hemen soru. Video izlemek çalışma sayılmaz.
- Canlı yayın FOMO'sunu kes: kayıt varsa yayını ertele.
- Ekran süresi kotası koy: günde en fazla 40-60 dk anlatım, kalan süre soru.`,
  doping: `Doping Hafıza kullanıyor. Yönlendirme kuralları:
- Programı Doping'in konu sırası ve kamp takvimine göre kur; kendi uydurma müfredatını dayatma.
- Video hızı 1.25-1.5x, not tutarak değil soru çözerek pekiştir.
- "Hafıza teknikleri"ni ezber derslerinde (tarih, coğrafya, biyoloji terim) kullan; matematikte sihir gibi satma.
- Uygulamadaki ödev/deneme/kamp kutularını günlük göreve çevir: bugün X videosu + Y soru.
- Takıldığın videoyu 2 kez izle, 3.de hoca/forum değil soru bankasına geç.
- Kamp dönemlerinde Doping kamp PDF/akışına sadık kal, ekstra kaynak ekleme.`,
  kaynak345: `345 ve All Star tek kaynak seti. Yönlendirme kuralları:
- 345 soru bankası + All Star deneme/ünite aynı programın parçası; aralarında kaynak değiştirme yarışı yok.
- Sıra: kısa tarama → 345/All Star ilgili ünite soruları → yanlış defteri → All Star veya 345 deneme.
- Günde net soru hedefi (ör. 40-60). Video çözümü yalnız yanlış/boşta aç.
- Branş denemesi haftalık; TYT genel deneme ayrı gün.
- Aynı üniteyi üçüncü bir bankayla şişirme.`,
  raunt: `Raunt kullanıyor. Yönlendirme kuralları:
- Raunt canlı ders + ödev + deneme takvimini "asıl okul" say. Çakışan ekstra kaynak ekleme.
- Canlı derse 5 dk kala hazır ol, ders sonrası aynı gün Raunt ödevini bitir.
- Kaçırılan canlı dersi kayıttan 1.5x izle, aynı gün soru çözmeden bırakma.
- Raunt deneme/istatistik ekranını kullan: net düşen branşı ertesi günün ilk bloğuna koy.
- Koçluk notlarını (varsa) görev olarak takvime yaz.
- Canlı dersi "dinledim" diye sayma; ölçülebilir çıktı: ödev tamam / X soru.`,
  other: `Kendi kaynağıyla ilerliyor. Yönlendirme: öğrencinin yazdığı kaynağı tek ana kaynak say, ikinci kaynağı ancak konu bittikten sonra aç.`,
};
