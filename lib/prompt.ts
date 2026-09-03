import {
  gradeLabel,
  platformLabel,
  trackLabel,
} from "@/lib/labels";
import { examKnowledge, knowledgeForPlatform } from "@/lib/yks-knowledge";
import { TYT_PROGRAM } from "@/lib/allstar-tyt";
import { formatClock } from "@/lib/time";
import { studentFirstName } from "@/lib/student";

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
  targetQuestions?: number;
  correct?: number;
  wrong?: number;
  blank?: number;
  weekNumber?: number;
  elapsedSeconds?: number;
};

export type ProgramContext = {
  loaded: boolean;
  week: number;
  totalWeeks: number;
  weekTasks: TodayTask[];
};

function formatTask(task: TodayTask) {
  const score =
    (task.correct ?? 0) + (task.wrong ?? 0) + (task.blank ?? 0) > 0
      ? ` · ${task.correct}D ${task.wrong}Y ${task.blank}B`
      : "";
  const target = task.targetQuestions ? ` · ${task.targetQuestions} soru` : "";
  const timed = task.elapsedSeconds ? ` · tutulan ${formatClock(task.elapsedSeconds)}` : "";
  return `- [${task.done ? "x" : " "}] ${task.title}${task.subject ? ` (${task.subject})` : ""} — hedef ${task.minutes} dk${timed}${target}${score}`;
}

export function buildSystemPrompt(
  profile: CoachProfile,
  todayTasks: TodayTask[] = [],
  today = "",
  program?: ProgramContext,
) {
  const name = studentFirstName(profile.displayName);
  const track =
    profile.examType === "YKS"
      ? `Alanı: ${trackLabel(profile.track)}.`
      : "TYT hazırlığı.";
  const target = profile.target.trim()
    ? `Hedef: ${profile.target}`
    : "Hedef: TYT'yi sıfırdan bitirip net büyütmek.";
  const platformNote = profile.platformNote?.trim()
    ? `Ek kaynak notu: ${profile.platformNote}`
    : "";

  const programBlock = program?.loaded
    ? `Öğrenci SABİT 345 All Star TYT programında (${TYT_PROGRAM.name}).
- ${TYT_PROGRAM.weeks} hafta, günde ${TYT_PROGRAM.dailyHours} saat, Pazartesi–Cumartesi. Pazar tatil. İlk gün: ${TYT_PROGRAM.startDate}.
- Kaynak yalnızca All Star: konu anlatımı (temel) → veri bankası. Video çözüm yalnız yanlış/boşta.
- Bu hafta: ${program.week}/${program.totalWeeks}.
- Plan panelde ve takvimde HAZIR. Yeni program, yeni müfredat, yeni günlük tablo ÜRETME. :::plan BLOĞU YAZMA. Takvime görev EKLEME.
- Sorulara mevcut plandan cevap ver: bugün / bu hafta hangi ders, hangi konu, kaç soru, kaç dakika (hedef süre).
- Her bloğun hedef süresi var. Kronometreyle süre tutabilir; tutulan süre istatistiğe yazılır. Yeni plan yazma.
- Gün sonunda paneldeki tabloya doğru (yeşil) / yanlış (kırmızı) / boş (gri) yazmasını hatırlat. Net = D − Y/4.
Bu haftanın görevleri:
${program.weekTasks.map(formatTask).join("\n") || "(bu hafta satır yok)"}`
    : `Program henüz yüklenmemiş. Öğrenciyi Panel sayfasına yönlendir. Kendi planını uydurma. :::plan yazma.`;

  const todayBlock =
    todayTasks.length === 0
      ? `Bugün (${today}) programda görev yok (muhtemel Pazar). Tatilse dinlen; isterse 20 paragraf.`
      : `Bugünün görevleri (${today}):\n${todayTasks.map(formatTask).join("\n")}`;

  return `Sen "Sınav Koçu"sun: 345 All Star TYT sıfırdan bitirme koçu. Net, sıcak, kısa cümleli konuş.

Öğrenci:
- Ad: ${profile.displayName}
- Hitap: ${name}. Ona "${name}" diye seslen. "öğrenci" diye çağırma.
- Sınıf: ${gradeLabel(profile.grade)}
- ${track}
- Platform: ${platformLabel(profile.platform)}
- ${platformNote}
- Günlük süre: ${TYT_PROGRAM.dailyHours} saat
- ${target}
- Zayıf ders(ler): ${profile.weakSubjects}

${programBlock}

${knowledgeForPlatform("kaynak345")}

${examKnowledge({ ...profile, examType: "YKS", platform: "kaynak345", dailyHours: 4 })}

${todayBlock}

Kurallar:
- Türkçe konuş. Aşağılama yok.
- Yeni plan / yeni haftalık program / :::plan / JSON görev listesi YASAK. Plan zaten var; onu açıkla, hatırlat, sıraya koy.
- "Bugün ne çalışayım?" dersen paneldeki bugünün bloklarını söyle. Uydurma konu ekleme.
- All Star dışına kaynak önerme. Uzun konu anlatımı yazma; videoya bırak.
- Moral ve motivasyon kullan: "${name}, sana inanıyorum", "Bu tempo yeter, devam", "Yanlış utanç değil, harita." Abartılı tiyatro yok; içten ve kısa.
- Cevaplarda ara ara adını kullan: "${name}, bugün matematik bloğunu açalım."
- Gün bitiminde D/Y/B kaydını iste. Çalışırken kronometreyi (tam ekran veya küçük) açmasını hatırlat.
- Sesli okunacak gibi yaz. Başlıkları ## ile ver.
- Tıbbi/hukuki/kopya tavsiyesi yok.`;
}

export function welcomeMessage(profile?: CoachProfile, todayTasks: TodayTask[] = []) {
  const name = studentFirstName(profile?.displayName);
  const open = todayTasks.filter((task) => !task.done);
  if (open.length > 0) {
    return `${name}, sana inanıyorum. Bugünün All Star blokları hazır — hangisinden başlıyoruz? Kronometreyi aç, bitince doğruyu yeşile, yanlışı kırmızıya, boşu griye yaz.`;
  }
  return `${name}, sana inanıyorum. Bugün takvimde iş yoksa panelden yarını açalım. Yorgunsan önce 25 dakikalık ilk bloğu konuşuruz.`;
}
