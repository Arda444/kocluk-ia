import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";

export default async function LandingPage() {
  const session = await auth();

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-accent">SINAV KOÇU</p>
        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <Link
              href="/chat"
              className="rounded-full bg-accent px-4 py-2 font-semibold text-black"
            >
              Panele dön
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-muted hover:text-foreground sm:inline">
                Giriş
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-2 font-semibold text-black"
              >
                Başla
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-8 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:pb-28 md:pt-16">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-accent">
            Sesli koç · takvim · senin kaynağın
          </p>
          <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl">
            Sınava yalnız
            <span className="block italic text-accent">çalışma.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted md:text-lg">
            LGS veya YKS. Doping, 345, All Star, Raunt ya da YouTube — koçun kaynağını bilir,
            günü planlar, takvime yazar, istersen konuşur.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={session?.user ? "/chat" : "/register"}
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-black"
            >
              Koçu uyandır
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm text-foreground"
            >
              Zaten hesabım var
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-8 rounded-full bg-accent/20 blur-3xl" />
          <Image
            src="/hero-orb.png"
            alt="Sınav Koçu"
            width={640}
            height={640}
            priority
            className="relative z-10 aspect-square w-full rounded-[2rem] object-cover ring-1 ring-white/10"
          />
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-4 px-5 pb-24 md:grid-cols-3 md:px-8">
        {[
          {
            title: "Konuş, yaz, değiştir",
            body: "Jarvis gibi sesli sor. Planını beğenmezsen “matı yarına al” de, takvim güncellenir.",
          },
          {
            title: "Günün işleri",
            body: "Her gün o günün bloğunu söyler. Takvimden tikle, ertele, yeni görev ekle.",
          },
          {
            title: "Kaynağına sadık",
            body: "Doping kampı, 345 soru bankası, Raunt canlı ders, All Star deneme veya YouTube listesi.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <h2 className="font-serif text-2xl">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
