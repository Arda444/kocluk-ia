import Link from "next/link";
import { RegisterForm } from "@/components/AuthForms";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Sınav Koçu
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Hesap oluştur</h1>
      <p className="mt-2 mb-8 text-slate-400">
        Ücretsiz kayıt ol; sınıfın ve hedefin kaydolur, sohbet geçmişin kalır.
      </p>
      <RegisterForm />
      <p className="mt-6 text-sm text-slate-400">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium text-amber-300 hover:underline">
          Giriş yap
        </Link>
      </p>
    </main>
  );
}
