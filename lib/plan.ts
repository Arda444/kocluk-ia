import { istanbulToday, toISODate, weekRange } from "@/lib/dates";

export type PlanItem = {
  date: string;
  title: string;
  subject?: string;
  minutes?: number;
};

const PLAN_BLOCK = /:::plan\s*([\s\S]*?):::/gi;
const FENCE_BLOCK = /```(?:json|plan)?\s*([\s\S]*?)```/gi;

const DAY_INDEX: Array<{ keys: string[]; offset: number }> = [
  { keys: ["pazartesi", "pzt"], offset: 0 },
  { keys: ["salı", "sali", "sal"], offset: 1 },
  { keys: ["çarşamba", "carsamba", "çar", "car"], offset: 2 },
  { keys: ["perşembe", "persembe", "per"], offset: 3 },
  { keys: ["cuma"], offset: 4 },
  { keys: ["cumartesi", "cmt"], offset: 5 },
  { keys: ["pazar", "paz"], offset: 6 },
];

function splitCells(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparator(line: string) {
  const cells = splitCells(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, "")));
}

function isTableRow(line: string) {
  return line.includes("|") && splitCells(line).length >= 2;
}

function normalizeDay(label: string) {
  return label
    .toLocaleLowerCase("tr")
    .replace(/[^a-zçğıöşüı]/g, "");
}

function dateForDayLabel(label: string, today: string) {
  const key = normalizeDay(label);
  const hits: Array<{ offset: number; len: number }> = [];
  for (const day of DAY_INDEX) {
    for (const item of day.keys) {
      if (key === item || key.startsWith(item)) {
        hits.push({ offset: day.offset, len: item.length });
      }
    }
  }
  hits.sort((a, b) => b.len - a.len);
  const match = hits[0];
  if (!match || match.len < 3) return null;
  const monday = weekRange(today).start;
  const date = new Date(`${monday}T12:00:00`);
  date.setDate(date.getDate() + match.offset);
  return toISODate(date);
}

function guessSubject(title: string) {
  const text = title.toLocaleLowerCase("tr");
  if (/geo|üçgen|trigon|analitik/.test(text)) return "Geometri";
  if (/mat|fonksiyon|problem|sayı/.test(text)) return "Matematik";
  if (/fizik/.test(text)) return "Fizik";
  if (/kimya/.test(text)) return "Kimya";
  if (/biyo/.test(text)) return "Biyoloji";
  if (/edebiyat/.test(text)) return "Edebiyat";
  if (/türkçe|paragraf|dil bilg/.test(text)) return "Türkçe";
  if (/tarih/.test(text)) return "Tarih";
  if (/coğraf|cograf/.test(text)) return "Coğrafya";
  if (/felsefe/.test(text)) return "Felsefe";
  if (/ingiliz|ydt/.test(text)) return "İngilizce";
  if (/ayt/.test(text)) return "AYT Deneme";
  if (/tyt|deneme/.test(text)) return "TYT Deneme";
  if (/lgs/.test(text)) return "LGS Deneme";
  return "";
}

function guessMinutes(title: string, header = "") {
  const blob = `${header} ${title}`;
  const found = blob.match(/(\d{2,3})\s*(dk|dakika)?/i);
  const value = found ? Number(found[1]) : 45;
  if (value < 10) return 40;
  if (value > 180) return 90;
  return value;
}

function parsePlanList(value: unknown): PlanItem[] {
  const list = Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
  const items: PlanItem[] = [];
  for (const row of list) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const date = String(record.date ?? "").slice(0, 10);
    const title = String(record.title ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !title) continue;
    items.push({
      date,
      title,
      subject: String(record.subject ?? "").trim() || guessSubject(title),
      minutes: Number(record.minutes) > 0 ? Number(record.minutes) : 40,
    });
  }
  return items;
}

function parseJsonish(raw: string): PlanItem[] {
  const trimmed = raw.trim().replace(/^```(?:json|plan)?/i, "").replace(/```$/, "").trim();
  try {
    return parsePlanList(JSON.parse(trimmed));
  } catch {
    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");
    if (start >= 0 && end > start) {
      try {
        return parsePlanList(JSON.parse(trimmed.slice(start, end + 1)));
      } catch {
        return [];
      }
    }
    return [];
  }
}

function itemsFromTables(text: string, today: string): PlanItem[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const items: PlanItem[] = [];
  for (let index = 0; index < lines.length - 2; index += 1) {
    const headerLine = lines[index] ?? "";
    const sep = lines[index + 1] ?? "";
    if (!isTableRow(headerLine) || !isSeparator(sep)) continue;
    const headers = splitCells(headerLine);
    index += 2;
    while (index < lines.length && isTableRow(lines[index] ?? "") && !isSeparator(lines[index] ?? "")) {
      const cells = splitCells(lines[index] ?? "");
      const day = cells[0] ?? "";
      const date = dateForDayLabel(day, today);
      index += 1;
      if (!date) continue;
      cells.forEach((cell, cellIndex) => {
        if (cellIndex === 0) return;
        const header = headers[cellIndex] ?? "";
        if (/gün|net/i.test(header) || !cell || /^[-–—]+$/.test(cell)) return;
        if (/dinlen|tatil|mola günü/i.test(cell) && cell.length < 24) return;
        items.push({
          date,
          title: cell.replace(/\s+/g, " ").trim(),
          subject: guessSubject(`${header} ${cell}`),
          minutes: guessMinutes(cell, header),
        });
      });
    }
  }
  return items;
}

function uniqueItems(items: PlanItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.date}|${item.title.toLocaleLowerCase("tr")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function extractPlanItems(text: string, today = istanbulToday()): { clean: string; items: PlanItem[] } {
  const items: PlanItem[] = [];

  const clean = text
    .replace(PLAN_BLOCK, (_full, json: string) => {
      items.push(...parseJsonish(String(json)));
      return "";
    })
    .replace(FENCE_BLOCK, (_full, json: string) => {
      const parsed = parseJsonish(String(json));
      if (parsed.length) {
        items.push(...parsed);
        return "";
      }
      return _full;
    });

  if (!items.length) {
    const loose = text.match(/\[[\s\S]*?"date"[\s\S]*?\]/);
    if (loose) items.push(...parseJsonish(loose[0]));
  }
  if (!items.length) {
    items.push(...itemsFromTables(text, today));
  }

  return { clean: clean.trim(), items: uniqueItems(items) };
}

export function stripPlanBlocks(text: string) {
  return text.replace(PLAN_BLOCK, "").replace(FENCE_BLOCK, "").trim();
}
