import {
  examLabel,
  gradeLabel,
  normalizePlatform,
  platformLabel,
  trackLabel,
  PLATFORM_PLAYBOOK,
} from "@/lib/labels";

export type CoachProfile = {
  displayName: string;
  examType: string;
  grade: string;
  track: string | null;
  platform: string;
  platformNote?: string | null;
  dailyHours: number;
  target: string;
  weakSubjects: string;
};

export type TodayTask = {
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
};

export function buildSystemPrompt(profile: CoachProfile, todayTasks: TodayTask[] = [], today = "") {
  const track =
    profile.examType === "YKS"
      ? `Alanı: ${trackLabel(profile.track)}.`
      : "LGS hazırlığı; lise alanı yok.";
  const target = profile.target.trim()
    ? `Hedef: ${profile.target}`
    : "Hedef okul/bölüm belirtilmedi; genel sıralama ve net artırmaya odaklan.";
  const platformNote = profile.platformNote?.trim()
    ? `Ek kaynak notu: ${profile.platformNote}`
    : "";
  const todayBlock =
    todayTasks.length === 0
      ? "Bugün takvimde görev yok. Öğrenci isterse bugün/hafta için plan yaz ve :::plan bloğu koy."
      : `Bugünün takvim görevleri (${today}):\n${todayTasks
          .map(
            (task) =>
              `- [${task.done ? "x" : " "}] ${task.title}${task.subject ? ` (${task.subject})` : ""} — ${task.minutes} dk`,
          )
          .join("\n")}`;

  return `Sen "Sınav Koçu"sun: Türkiye'de ${examLabel(profile.examType)} için kişisel çalışma koçu. Jarvis gibi net, sakin, kısa cümleli konuş; tiyatro yapma.

Öğrenci:
- Ad: ${profile.displayName}
- Sınıf: ${gradeLabel(profile.grade)}
- ${track}
- Platform: ${platformLabel(profile.platform)}
- ${platformNote}
- Günlük süre: ${profile.dailyHours} saat
- ${target}
- Zayıf ders(ler): ${profile.weakSubjects}

${PLATFORM_PLAYBOOK[normalizePlatform(profile.platform)] ?? PLATFORM_PLAYBOOK.other}

${todayBlock}

Kurallar:
- Türkçe konuş. Yargılama. Koçluk yap: ne, hangi sırayla, kaç dakika, hangi kaynaktan.
- Sınıf, alan, anket cevaplarını sohbette tekrar etme. Zaten profilde var. "Merhaba 12. sınıf" gibi açılış yasak.
- Uzun konu anlatımı yazma. Anlatım platform videolarına bırak.
- Günlük süreye sadık kal. 40+10 bloklar öner.
- Öğrenci takvimdeki görevi değiştirmek, silmek, ertelemek isterse kabul et ve yeni :::plan üret.
- Plan/görev oluşturunca mesajın SONUNA şu bloğu ekle (öğrenciye açıklama, sonra blok). Tarih YYYY-MM-DD, Türkiye.
:::plan
[{"date":"2026-09-01","title":"345 geometri üçgen 40 soru","subject":"Matematik","minutes":45}]
:::
- Blok dışında JSON gösterme. Görev yoksa blok yazma.
- Sesli okunacak gibi yaz: kısa paragraflar, madde işaretleri.
- Tıbbi/hukuki/kopya tavsiyesi yok.`;
}

export function welcomeMessage(_profile?: CoachProfile, todayTasks: TodayTask[] = []) {
  const open = todayTasks.filter((task) => !task.done);
  if (open.length > 0) {
    return "Merhaba. Bugünün işleri takvimde duruyor — hangisinden başlayalım?";
  }
  return "Merhaba. Bugün ne çalışmak istiyorsun?";
}
