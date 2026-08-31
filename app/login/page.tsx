import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 text-xs font-semibold tracking-[0.2em] text-accent">
        ← Sınav Koçu
      </Link>
      <h1 className="font-serif text-4xl">Tekrar merhaba</h1>
      <p className="mt-2 mb-8 text-muted">Planın ve sohbetlerin seni bekliyor.</p>
      <LoginForm />
      <p className="mt-6 text-sm text-muted">
        Hesabın yok mu?{" "}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Kayıt ol
        </Link>
      </p>
    </main>
  );
}
