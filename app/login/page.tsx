import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Sınav Koçu
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Tekrar hoş geldin</h1>
      <p className="mt-2 mb-8 text-slate-400">
        LGS veya YKS hazırlığını bıraktığın yerden sürdürmek için giriş yap.
      </p>
      <LoginForm />
      <p className="mt-6 text-sm text-slate-400">
        Hesabın yok mu?{" "}
        <Link href="/register" className="font-medium text-amber-300 hover:underline">
          Kayıt ol
        </Link>
      </p>
    </main>
  );
}
