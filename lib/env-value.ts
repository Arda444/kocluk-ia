export function readEnv(...names: string[]) {
  for (const name of names) {
    let raw = (process.env[name] ?? "").trim().replace(/^["']+|["']+$/g, "");
    const prefix = `${name}=`;
    if (raw.toUpperCase().startsWith(prefix.toUpperCase())) {
      raw = raw.slice(prefix.length).trim().replace(/^["']+|["']+$/g, "");
    }
    if (raw) return raw;
  }
  return "";
}

export function tursoConfig() {
  let url = readEnv("TURSO_DATABASE_URL");
  const authToken = readEnv("TURSO_AUTH_TOKEN");
  if (!url) return null;
  if (/app\.turso\.tech/i.test(url)) return null;
  if (url.startsWith("https://") && /turso\.io/i.test(url)) {
    url = url.replace("https://", "libsql://");
  }
  if (!url.startsWith("libsql://")) return null;
  return { url, authToken: authToken || undefined };
}
