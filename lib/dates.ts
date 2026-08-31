export function istanbulToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
}

export function istanbulNowLabel() {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: string; inMonth: boolean; day: number }> = [];
  for (let i = 0; i < start; i += 1) {
    const date = new Date(year, month, 1 - (start - i));
    cells.push({
      date: toISODate(date),
      inMonth: false,
      day: date.getDate(),
    });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: toISODate(new Date(year, month, day)),
      inMonth: true,
      day,
    });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const date = new Date(`${last.date}T12:00:00`);
    date.setDate(date.getDate() + 1);
    cells.push({
      date: toISODate(date),
      inMonth: false,
      day: date.getDate(),
    });
  }
  return cells;
}

export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
