export type PlanItem = {
  date: string;
  title: string;
  subject?: string;
  minutes?: number;
};

const PLAN_BLOCK = /:::plan\s*([\s\S]*?):::/g;

export function extractPlanItems(text: string): { clean: string; items: PlanItem[] } {
  const items: PlanItem[] = [];
  const clean = text.replace(PLAN_BLOCK, (_full, json: string) => {
    try {
      const parsed = JSON.parse(String(json).trim()) as unknown;
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const row of list) {
        if (!row || typeof row !== "object") continue;
        const record = row as Record<string, unknown>;
        const date = String(record.date ?? "").slice(0, 10);
        const title = String(record.title ?? "").trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !title) continue;
        items.push({
          date,
          title,
          subject: String(record.subject ?? "").trim(),
          minutes: Number(record.minutes) > 0 ? Number(record.minutes) : 40,
        });
      }
    } catch {
      return "";
    }
    return "";
  });
  return { clean: clean.trim(), items };
}

export function stripPlanBlocks(text: string) {
  return text.replace(PLAN_BLOCK, "").trim();
}
