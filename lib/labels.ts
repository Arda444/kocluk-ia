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
    value: "yayin345",
    label: "345",
    hint: "Soru bankası ve deneme",
  },
  {
    value: "allstar",
    label: "All Star",
    hint: "Kaynak ve deneme seti",
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

export function platformLabel(value: string | null | undefined) {
  if (!value) return "belirtilmedi";
  return PLATFORMS.find((item) => item.value === value)?.label ?? value;
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
  yayin345: `345 yayınları kullanıyor. Yönlendirme kuralları:
- 345 soru bankası = asıl iş. Konu anlatımı kısa tut, soru çözümü merkeze al.
- Sıra: konu tarama testi → 345 ilgili ünite → yanlışlar defteri → 345 deneme.
- "Bitirme yarışı" yapma: günde net sayfa/soru hedefi (ör. 40-60 soru) koy.
- 345 video çözüm varsa yalnızca yanlış/boş sorularda aç.
- Branş denemelerini haftalık yerleştir; TYT genel denemeyi ayrı gün koy.
- Aynı üniteyi 345 + başka bankayla şişirme; önce 345 bitsin.`,
  allstar: `All Star kaynaklarıyla hazırlanıyor. Yönlendirme kuralları:
- All Star setinin kendi konu-deneme dengesini bozma.
- Günlük: All Star ünite soruları + yanlış analizi.
- Deneme günlerinde All Star deneme çöz, hemen sonra net-branş tablosu çıkar.
- All Star'da zor madde (yıldızlı/seçmeli) ayrı oturum olsun, moral bozmasın diye ilk turda atlanabilir.
- Eksik konuda kısa video (Doping/YouTube 15 dk) sonra All Star'a dön. Kaynak değişme.`,
  raunt: `Raunt kullanıyor. Yönlendirme kuralları:
- Raunt canlı ders + ödev + deneme takvimini "asıl okul" say. Çakışan ekstra kaynak ekleme.
- Canlı derse 5 dk kala hazır ol, ders sonrası aynı gün Raunt ödevini bitir.
- Kaçırılan canlı dersi kayıttan 1.5x izle, aynı gün soru çözmeden bırakma.
- Raunt deneme/istatistik ekranını kullan: net düşen branşı ertesi günün ilk bloğuna koy.
- Koçluk notlarını (varsa) görev olarak takvime yaz.
- Canlı dersi "dinledim" diye sayma; ölçülebilir çıktı: ödev tamam / X soru.`,
  other: `Kendi kaynağıyla ilerliyor. Yönlendirme: öğrencinin yazdığı kaynağı tek ana kaynak say, ikinci kaynağı ancak konu bittikten sonra aç.`,
};
