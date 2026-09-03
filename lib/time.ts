export function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function formatClock(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours > 0) return `${hours}:${pad2(minutes)}:${pad2(rest)}`;
  return `${pad2(minutes)}:${pad2(rest)}`;
}

export function formatHours(seconds: number) {
  return Math.round((seconds / 3600) * 10) / 10;
}

export function shortTopic(title: string) {
  return title.replace(/^All Star /, "").replace(/ — .*$/, "");
}
