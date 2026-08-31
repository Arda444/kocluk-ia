# Sınav Koçu

LGS ve YKS hazırlık koçu. Kayıt/giriş, tanışma soruları (sınıf, alan, günlük süre), kalıcı sohbet geçmişi.

- Kod: [github.com/Arda444/kocluk-ia](https://github.com/Arda444/kocluk-ia) (yalnızca bu hesap)
- Ücretsiz yığın: Next.js, Groq, SQLite (yerel) / Turso (canlı), Vercel
- GitHub Pages kullanılmaz (sunucu + veritabanı gerekir)

## Yerel kurulum

1. [Groq Console](https://console.groq.com) → API key
2. `.env.example` dosyasını `.env` olarak kopyala
3. `GROQ_API_KEY` ve `AUTH_SECRET` doldur (`openssl rand -hex 32`)

```bash
npm install
npx prisma migrate dev
npm run dev
```

Tarayıcı: http://localhost:3000

## Canlı yayın (Vercel + Turso)

Windows’ta Turso CLI yok; veritabanını tarayıcıdan oluştur.

1. [app.turso.tech](https://app.turso.tech) — GitHub (Arda444) ile giriş, veritabanı oluştur, URL + token kopyala
2. [Vercel New Project](https://vercel.com/new/import?s=https://github.com/Arda444/kocluk-ia) — GitHub **Arda444** ile giriş, `kocluk-ia` reposunu import et
3. Vercel → Project → Settings → Environment Variables (Production + Preview):

- `AUTH_SECRET` — rastgele 32+ karakter (`openssl rand -hex 32`)
- `AUTH_URL` — `https://kocluk-ia.vercel.app`
- `AUTH_TRUST_HOST` — `true`
- `DATABASE_URL` — `file:./dev.db` (yalnız build)
- `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` — kayıtların kalması için zorunlu
- `GROQ_API_KEY` — koç cevapları için

`AUTH_SECRET` yoksa giriş `/api/auth/callback/credentials` adresinde "server configuration" JSON hatası verir. Değişkenleri kaydettikten sonra **Redeploy**.

4. Deploy sonrası kendi makinede şemayı Turso’ya bas:

```bash
# .env içine TURSO_DATABASE_URL ve TURSO_AUTH_TOKEN
npm run db:turso
```

5. Vercel’de Redeploy. Adres: `https://<proje>.vercel.app`
