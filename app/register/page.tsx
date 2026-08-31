import Link from "next/link";
import { RegisterForm } from "@/components/AuthForms";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 text-xs font-semibold tracking-[0.2em] text-accent">
        ← Sınav Koçu
      </Link>
      <h1 className="font-serif text-4xl">Koçunu oluştur</h1>
      <p className="mt-2 mb-8 text-muted">Ücretsiz. Önce birkaç soru, sonra takvim ve sohbet.</p>
      <RegisterForm />
      <p className="mt-6 text-sm text-muted">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Giriş yap
        </Link>
      </p>
    </main>
  );
}
