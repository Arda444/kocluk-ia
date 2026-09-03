import { addDays, weekdayIndex } from "@/lib/dates";

export const TYT_PROGRAM = {
  id: "allstar-tyt",
  name: "345 All Star TYT — sıfırdan bitirme",
  weeks: 18,
  studyDaysPerWeek: 6,
  dailyMinutes: 240,
  dailyHours: 4,
  source: "allstar-tyt",
  startDate: "2026-09-04",
} as const;

export type TopicUnit = {
  key: string;
  subject: string;
  title: string;
  questions: number;
  blocks: number;
  minutes: number;
};

export type ProgramTaskSeed = {
  date: string;
  weekNumber: number;
  title: string;
  subject: string;
  topicKey: string;
  minutes: number;
  targetQuestions: number;
  source: typeof TYT_PROGRAM.source;
};

type Block = TopicUnit & { kind: string; part: number };

function unit(
  subject: string,
  key: string,
  title: string,
  blocks: number,
  questions: number,
  minutes: number,
): TopicUnit {
  return { key: `${subject.toLocaleLowerCase("tr")}-${key}`, subject, title, blocks, questions, minutes };
}

function expand(units: TopicUnit[]): Block[] {
  const out: Block[] = [];
  for (const item of units) {
    for (let part = 1; part <= item.blocks; part += 1) {
      const kind =
        item.blocks === 1
          ? "konu + veri bankası"
          : part === 1
            ? "konu anlatımı + soru"
            : part === item.blocks
              ? "pekiştirme + soru"
              : "veri bankası";
      out.push({ ...item, kind, part });
    }
  }
  return out;
}

function take(queue: Block[]): Block | null {
  return queue.shift() ?? null;
}

function refillReview(subject: string, minutes: number, questions: number): Block {
  return {
    key: `${subject.toLocaleLowerCase("tr")}-tekrar`,
    subject,
    title: "Karışık tekrar",
    questions,
    blocks: 1,
    minutes,
    kind: "tekrar + soru",
    part: 1,
  };
}

function titleOf(block: Block) {
  const part = block.blocks > 1 ? ` ${block.part}/${block.blocks}` : "";
  return `All Star ${block.subject} · ${block.title}${part} — ${block.kind} · ${block.questions} soru`;
}

const MAT: TopicUnit[] = [
  unit("Matematik", "temel", "Temel kavramlar", 3, 30, 70),
  unit("Matematik", "basamak", "Sayı basamakları", 2, 30, 70),
  unit("Matematik", "bolunme", "Bölme ve bölünebilme", 3, 30, 70),
  unit("Matematik", "ebob-ekok", "EBOB-EKOK", 2, 30, 70),
  unit("Matematik", "rasyonel", "Rasyonel sayılar", 2, 30, 70),
  unit("Matematik", "uslu", "Üslü sayılar", 3, 30, 70),
  unit("Matematik", "koklu", "Köklü sayılar", 3, 30, 70),
  unit("Matematik", "carpan", "Çarpanlara ayırma", 3, 30, 70),
  unit("Matematik", "esitsizlik", "Basit eşitsizlikler", 2, 30, 70),
  unit("Matematik", "mutlak", "Mutlak değer", 3, 30, 70),
  unit("Matematik", "oran", "Oran-orantı", 2, 30, 70),
  unit("Matematik", "pr-sayi", "Problemler: sayı-kesir", 3, 30, 70),
  unit("Matematik", "pr-yuzde", "Problemler: yüzde-faiz", 3, 30, 70),
  unit("Matematik", "pr-yas", "Problemler: yaş-işçi", 3, 30, 70),
  unit("Matematik", "pr-hareket", "Problemler: hareket", 3, 30, 70),
  unit("Matematik", "pr-karisim", "Problemler: karışım-kâr", 2, 30, 70),
  unit("Matematik", "kumeler", "Kümeler", 3, 30, 70),
  unit("Matematik", "islem", "İşlem", 2, 30, 70),
  unit("Matematik", "fonksiyon", "Fonksiyonlar", 4, 30, 70),
  unit("Matematik", "sayma", "Permütasyon-kombinasyon", 3, 30, 70),
  unit("Matematik", "olasilik", "Olasılık", 3, 30, 70),
  unit("Matematik", "veri", "Veri ve istatistik", 3, 30, 70),
  unit("Matematik", "mantik", "Mantık", 2, 30, 70),
];

const GEO: TopicUnit[] = [
  unit("Geometri", "dogru-aci", "Doğruda açılar", 2, 25, 70),
  unit("Geometri", "ucgen-aci", "Üçgende açılar", 3, 25, 70),
  unit("Geometri", "aciortay", "Açıortay ve kenarortay", 2, 25, 70),
  unit("Geometri", "eslik", "Eşlik ve benzerlik", 3, 25, 70),
  unit("Geometri", "dik", "Dik üçgen", 3, 25, 70),
  unit("Geometri", "alan", "Üçgende alan", 3, 25, 70),
  unit("Geometri", "ozel", "Özel üçgenler", 2, 25, 70),
  unit("Geometri", "dortgen", "Dikdörtgen ve paralelkenar", 3, 25, 70),
  unit("Geometri", "kare-ed", "Kare ve eşkenar dörtgen", 2, 25, 70),
  unit("Geometri", "yamuk", "Yamuk", 2, 25, 70),
  unit("Geometri", "cokgen", "Çokgenler", 2, 25, 70),
  unit("Geometri", "cember", "Çemberde açı ve uzunluk", 4, 25, 70),
  unit("Geometri", "daire", "Dairede alan", 2, 25, 70),
  unit("Geometri", "analitik", "Analitik geometri", 2, 25, 70),
  unit("Geometri", "kati", "Katı cisimler", 2, 25, 70),
];

const TUR: TopicUnit[] = [
  unit("Türkçe", "sozcuk", "Sözcükte anlam", 3, 25, 55),
  unit("Türkçe", "cumle", "Cümlede anlam", 3, 25, 55),
  unit("Türkçe", "paragraf-giris", "Paragraf stratejisi", 4, 30, 55),
  unit("Türkçe", "anlatim", "Anlatım biçimleri", 2, 20, 55),
  unit("Türkçe", "ses", "Ses bilgisi", 2, 20, 55),
  unit("Türkçe", "yazim", "Yazım kuralları", 3, 25, 55),
  unit("Türkçe", "noktalama", "Noktalama", 3, 25, 55),
  unit("Türkçe", "yapi", "Sözcükte yapı", 3, 20, 55),
  unit("Türkçe", "turler", "Sözcük türleri", 4, 25, 55),
  unit("Türkçe", "fiilimsi", "Fiilimsiler", 3, 20, 55),
  unit("Türkçe", "oge", "Cümlenin ögeleri", 3, 20, 55),
  unit("Türkçe", "cumle-tur", "Cümle türleri", 2, 20, 55),
  unit("Türkçe", "bozukluk", "Anlatım bozukluğu", 3, 25, 55),
];

const FIZIK: TopicUnit[] = [
  unit("Fizik", "giris", "Fizik bilimine giriş", 2, 20, 60),
  unit("Fizik", "madde", "Madde ve özellikleri", 3, 20, 60),
  unit("Fizik", "basinc", "Basınç ve kaldırma", 3, 20, 60),
  unit("Fizik", "isi", "Isı, sıcaklık, genleşme", 3, 20, 60),
  unit("Fizik", "hareket", "Hareket", 5, 20, 60),
  unit("Fizik", "kuvvet", "Kuvvet ve Newton yasaları", 5, 20, 60),
  unit("Fizik", "enerji", "İş, güç, enerji", 4, 20, 60),
  unit("Fizik", "elektrostatik", "Elektrostatik", 4, 20, 60),
  unit("Fizik", "akim", "Elektrik akımı", 4, 20, 60),
  unit("Fizik", "dalga", "Dalgalar", 4, 20, 60),
  unit("Fizik", "optik", "Optik", 3, 20, 60),
];

const KIMYA: TopicUnit[] = [
  unit("Kimya", "giris", "Kimya bilimi", 3, 20, 60),
  unit("Kimya", "atom", "Atom ve yapısı", 4, 20, 60),
  unit("Kimya", "periyodik", "Periyodik sistem", 3, 20, 60),
  unit("Kimya", "etkilesim", "Kimyasal türler arası etkileşimler", 4, 20, 60),
  unit("Kimya", "haller", "Maddenin halleri", 4, 20, 60),
  unit("Kimya", "karisim", "Karışımlar", 5, 20, 60),
  unit("Kimya", "asit", "Asitler, bazlar, tuzlar", 5, 20, 60),
  unit("Kimya", "heryerde", "Kimya her yerde", 3, 20, 60),
];

const BIYO: TopicUnit[] = [
  unit("Biyoloji", "ortak", "Canlıların ortak özellikleri", 3, 18, 60),
  unit("Biyoloji", "bilesen", "Canlıların temel bileşenleri", 4, 18, 60),
  unit("Biyoloji", "hucre", "Hücre ve organeller", 5, 18, 60),
  unit("Biyoloji", "gecis", "Hücre zarından madde geçişi", 3, 18, 60),
  unit("Biyoloji", "sinif", "Canlılar dünyası", 4, 18, 60),
  unit("Biyoloji", "bolunme", "Hücre bölünmeleri", 4, 18, 60),
  unit("Biyoloji", "kalitim", "Kalıtım", 5, 18, 60),
  unit("Biyoloji", "ekosistem", "Ekosistem ve çevre", 4, 18, 60),
];

const TARIH: TopicUnit[] = [
  unit("Tarih", "bilim", "Tarih bilimi", 3, 18, 55),
  unit("Tarih", "ilk-cag", "İlk çağ uygarlıkları", 4, 18, 55),
  unit("Tarih", "islam", "İslam tarihi ve uygarlığı", 4, 18, 55),
  unit("Tarih", "turk-islam", "Türk-İslam devletleri", 4, 18, 55),
  unit("Tarih", "osmanli-kurulus", "Osmanlı kuruluş ve yükselme", 5, 18, 55),
  unit("Tarih", "osmanli-kultur", "Osmanlı kültür ve medeniyet", 4, 18, 55),
  unit("Tarih", "19yy", "19. yüzyıl ve dağılma", 4, 18, 55),
  unit("Tarih", "milli", "Milli mücadele", 4, 18, 55),
  unit("Tarih", "inkilap", "Atatürk ilke ve inkılapları", 4, 18, 55),
];

const COG: TopicUnit[] = [
  unit("Coğrafya", "harita", "Harita bilgisi", 3, 18, 55),
  unit("Coğrafya", "dunya", "Dünya'nın şekli ve hareketleri", 3, 18, 55),
  unit("Coğrafya", "iklim", "İklim ve atmosfer", 5, 18, 55),
  unit("Coğrafya", "yersekli", "Yerşekilleri", 4, 18, 55),
  unit("Coğrafya", "nufus", "Nüfus ve yerleşme", 4, 18, 55),
  unit("Coğrafya", "goc", "Göç", 3, 18, 55),
  unit("Coğrafya", "ekonomi", "Ekonomik faaliyetler", 4, 18, 55),
  unit("Coğrafya", "turkiye", "Türkiye coğrafyası", 4, 18, 55),
  unit("Coğrafya", "cevre", "Çevre ve afet", 3, 18, 55),
];

const FELSEFE: TopicUnit[] = [
  unit("Felsefe", "tanim", "Felsefeyi tanıma", 3, 15, 55),
  unit("Felsefe", "bilgi", "Bilgi felsefesi", 3, 15, 55),
  unit("Felsefe", "varlik", "Varlık felsefesi", 3, 15, 55),
  unit("Felsefe", "ahlak", "Ahlak felsefesi", 3, 15, 55),
  unit("Felsefe", "din", "Din felsefesi", 2, 15, 55),
  unit("Felsefe", "siyaset", "Siyaset felsefesi", 2, 15, 55),
  unit("Felsefe", "bilim", "Bilim ve sanat felsefesi", 2, 15, 55),
];

const DIN: TopicUnit[] = [
  unit("Din", "inanc", "İnanç", 3, 15, 55),
  unit("Din", "ibadet", "İbadet", 3, 15, 55),
  unit("Din", "hz", "Hz. Muhammed", 3, 15, 55),
  unit("Din", "ahlak", "Ahlak", 3, 15, 55),
  unit("Din", "hayat", "Din ve hayat", 3, 15, 55),
  unit("Din", "yorum", "İslam düşüncesinde yorumlar", 3, 15, 55),
];

const PARAGRAF: Block = {
  key: "türkçe-paragraf",
  subject: "Türkçe",
  title: "Paragraf",
  questions: 30,
  blocks: 1,
  minutes: 55,
  kind: "All Star veri bankası",
  part: 1,
};

function nextFen(fizik: Block[], kimya: Block[], biyo: Block[], index: number): Block {
  const slot = index % 3;
  const picked =
    slot === 0 ? take(fizik) ?? take(kimya) ?? take(biyo) : slot === 1 ? take(kimya) ?? take(fizik) ?? take(biyo) : take(biyo) ?? take(fizik) ?? take(kimya);
  return picked ?? refillReview("Fizik", 60, 20);
}

function nextSosyal(tarih: Block[], cog: Block[], fel: Block[], din: Block[], index: number): Block {
  const slot = index % 6;
  if (slot === 0 || slot === 2) return take(tarih) ?? take(cog) ?? refillReview("Tarih", 55, 18);
  if (slot === 1 || slot === 3) return take(cog) ?? take(tarih) ?? refillReview("Coğrafya", 55, 18);
  if (slot === 4) return take(fel) ?? take(din) ?? refillReview("Felsefe", 55, 15);
  return take(din) ?? take(fel) ?? refillReview("Din", 55, 15);
}

function toTask(date: string, weekNumber: number, block: Block): ProgramTaskSeed {
  return {
    date,
    weekNumber,
    title: titleOf(block),
    subject: block.subject,
    topicKey: block.key,
    minutes: block.minutes,
    targetQuestions: block.questions,
    source: TYT_PROGRAM.source,
  };
}

export function allStarTopics() {
  return [...MAT, ...GEO, ...TUR, ...FIZIK, ...KIMYA, ...BIYO, ...TARIH, ...COG, ...FELSEFE, ...DIN];
}

export function buildAllStarTytProgram(startDate: string): ProgramTaskSeed[] {
  const mat = expand(MAT);
  const geo = expand(GEO);
  const tur = expand(TUR);
  const fizik = expand(FIZIK);
  const kimya = expand(KIMYA);
  const biyo = expand(BIYO);
  const tarih = expand(TARIH);
  const cog = expand(COG);
  const fel = expand(FELSEFE);
  const din = expand(DIN);

  const tasks: ProgramTaskSeed[] = [];
  let fenIndex = 0;
  let sosyalIndex = 0;

  for (let week = 1; week <= TYT_PROGRAM.weeks; week += 1) {
    for (let offset = 0; offset < 7; offset += 1) {
      const date = addDays(startDate, (week - 1) * 7 + offset);
      const weekday = weekdayIndex(date);
      if (weekday === 6) continue;

      const denemeSaturday = week >= 16 && weekday === 5;
      if (denemeSaturday) {
        tasks.push({
          date,
          weekNumber: week,
          title: `All Star TYT deneme ${week - 15} — 120 soru, süre tut`,
          subject: "TYT Deneme",
          topicKey: `tyt-deneme-${week}`,
          minutes: 165,
          targetQuestions: 120,
          source: TYT_PROGRAM.source,
        });
        tasks.push({
          date,
          weekNumber: week,
          title: "Deneme analizi — yanlış defteri + All Star ilgili ünite",
          subject: "TYT Deneme",
          topicKey: `tyt-analiz-${week}`,
          minutes: 75,
          targetQuestions: 0,
          source: TYT_PROGRAM.source,
        });
        continue;
      }

      const mathSlot = weekday === 1 || weekday === 3 ? take(geo) ?? take(mat) : take(mat) ?? take(geo);
      const math = mathSlot ?? refillReview(weekday === 1 || weekday === 3 ? "Geometri" : "Matematik", 70, 30);
      const turkce = take(tur) ?? { ...PARAGRAF };
      const fen = nextFen(fizik, kimya, biyo, fenIndex);
      fenIndex += 1;
      const sosyal = nextSosyal(tarih, cog, fel, din, sosyalIndex);
      sosyalIndex += 1;

      tasks.push(toTask(date, week, math), toTask(date, week, turkce), toTask(date, week, fen), toTask(date, week, sosyal));
    }
  }

  return tasks;
}

export function defaultProgramStart(_today?: string) {
  return TYT_PROGRAM.startDate;
}

export function tytNet(correct: number, wrong: number) {
  return Math.round((correct - wrong / 4) * 100) / 100;
}

export function programWeekOf(startMonday: string, date: string) {
  const start = new Date(`${startMonday}T12:00:00`).getTime();
  const current = new Date(`${date}T12:00:00`).getTime();
  const diff = Math.floor((current - start) / 86_400_000);
  if (diff < 0) return 0;
  return Math.floor(diff / 7) + 1;
}
