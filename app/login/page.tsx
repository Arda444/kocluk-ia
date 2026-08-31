import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";

function authErrorMessage(error?: string) {
  if (error === "SessionExpired") {
    return "Oturumun sona erdi. Lütfen tekrar giriş yap veya kayıt ol.";
  }
  if (error === "Configuration") {
    return "Giriş şu an yapılamıyor. Lütfen biraz sonra tekrar dene.";
  }
  if (error === "CredentialsSignin" || error === "AccessDenied") {
    return "E-posta veya şifre hatalı.";
  }
  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const banner = authErrorMessage(error);

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 text-xs font-semibold tracking-[0.2em] text-accent">
        ← Sınav Koçu
      </Link>
      <h1 className="font-serif text-4xl">Tekrar merhaba</h1>
      <p className="mt-2 mb-8 text-muted">Planın ve sohbetlerin seni bekliyor.</p>
      {banner ? (
        <p className="mb-6 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{banner}</p>
      ) : null}
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
