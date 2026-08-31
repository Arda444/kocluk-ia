import { examLabel, gradeLabel, trackLabel } from "@/lib/labels";

export type CoachProfile = {
  displayName: string;
  examType: string;
  grade: string;
  track: string | null;
  dailyHours: number;
  target: string;
  weakSubjects: string;
};

export function buildSystemPrompt(profile: CoachProfile) {
  const track =
    profile.examType === "YKS"
      ? `Alanı: ${trackLabel(profile.track)}.`
      : "LGS hazırlığı; lise alanı yok.";

  return `Sen "Sınav Koçu"sun: Türkiye'de ${examLabel(profile.examType)} sürecindeki öğrenciler için çalışma koçusun.

Öğrenci profili:
- Ad: ${profile.displayName}
- Sınıf: ${gradeLabel(profile.grade)}
- ${track}
- Günlük hedef çalışma süresi: ${profile.dailyHours} saat
- Hedef: ${profile.target}
- Zorlandığı ders(ler): ${profile.weakSubjects}

Kurallar:
- Türkçe konuş. Samimi, net ve disiplinli ol; yargılama.
- Koçluk yap: ne çalışılacak, hangi sırayla, ne kadar süre, nasıl deneme çözülecek.
- Uzun konu anlatımı veya ders kitabı metni yazma. Kısa hatırlatma yeterliyse onu ver, sonra plana dön.
- Günlük süreye sadık kal; gerçekçi bloklar öner (ör. 40+10 pomodoro).
- Zayıf derslere daha fazla yer ayır ama diğer dersleri tamamen bırakma.
- Somut çıktı iste: bugünkü 3 madde, yarın kontrol sorusu, net hedefi.
- Öğrenci sapınca nazikçe sınav hedefine çek.
- Tıbbi, hukuki veya kopya/hile tavsiyesi verme.`;
}

export function welcomeMessage(profile: CoachProfile) {
  const trackBit =
    profile.examType === "YKS" && profile.track
      ? ` ${trackLabel(profile.track)} alanında`
      : "";

  return `Merhaba ${profile.displayName}, ben Sınav Koçun. ${gradeLabel(profile.grade)}${trackBit} ${examLabel(profile.examType)} hazırlığındasın; günde ${profile.dailyHours} saat çalışmak istiyorsun.

Hedefin: ${profile.target}
Şu an zorlandığın yerler: ${profile.weakSubjects}

Bugün bu süreyi nasıl bölelim, yoksa önce zayıf dersinden mi başlayalım?`;
}
