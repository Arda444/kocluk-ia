function trimEnv(value: string | undefined) {
  return (value ?? "").trim().replace(/^["']+|["']+$/g, "");
}

/** Edge-safe stand-in when AUTH_SECRET is missing on Vercel. */
function stableSecret(seed: string) {
  const source = `kocluk-ia-auth:${seed}`;
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `${hex}${source}`.replace(/[^a-zA-Z0-9]/g, "").padEnd(64, hex).slice(0, 64);
}

function resolveAuthSecret() {
  const direct = trimEnv(process.env.AUTH_SECRET) || trimEnv(process.env.NEXTAUTH_SECRET);
  if (direct && direct !== "replace-with-a-long-random-string") return direct;

  const groq = trimEnv(process.env.GROQ_API_KEY);
  if (groq) return stableSecret(groq);

  if (process.env.VERCEL) {
    return stableSecret(process.env.VERCEL_PROJECT_ID || process.env.VERCEL_URL || "vercel");
  }

  return "dev-only-kocluk-ia-auth-secret-not-for-production";
}

process.env.AUTH_SECRET = resolveAuthSecret();
process.env.AUTH_TRUST_HOST = "true";

if (process.env.VERCEL) {
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
  if (host) {
    const url = host.startsWith("http") ? host : `https://${host}`;
    const current = trimEnv(process.env.AUTH_URL);
    if (!current || /localhost|127\.0\.0\.1|turso\.tech/i.test(current)) {
      process.env.AUTH_URL = url;
    }
  }
}
