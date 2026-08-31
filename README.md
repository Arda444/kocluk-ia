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
3. Vercel Environment Variables:

| Değişken | Değer |
| --- | --- |
| `DATABASE_URL` | `file:./dev.db` (yalnız Prisma generate) |
| `TURSO_DATABASE_URL` | `libsql://...turso.io` |
| `TURSO_AUTH_TOKEN` | Turso token |
| `GROQ_API_KEY` | Groq anahtarı |
| `AUTH_SECRET` | uzun rastgele string |
| `AUTH_URL` | `https://<proje>.vercel.app` (ilk deploy sonrası güncelle) |

4. Deploy sonrası kendi makinede şemayı Turso’ya bas:

```bash
# .env içine TURSO_DATABASE_URL ve TURSO_AUTH_TOKEN
npm run db:turso
```

5. Vercel’de Redeploy. Adres: `https://<proje>.vercel.app`
