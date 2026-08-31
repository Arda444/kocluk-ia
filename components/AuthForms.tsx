"use client";

import { useActionState } from "react";
import { loginAction, registerAction, type ActionState } from "@/app/actions";

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-foreground outline-none ring-accent/40 placeholder:text-muted focus:ring-2"
      />
    </label>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={action} className="grid gap-4">
      <Field
        label="E-posta"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="ornek@mail.com"
      />
      <Field
        label="Şifre"
        name="password"
        type="password"
        autoComplete="current-password"
      />
      {state?.error ? (
        <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-accent font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    registerAction,
    undefined,
  );

  return (
    <form action={action} className="grid gap-4">
      <Field label="Ad" name="name" autoComplete="name" placeholder="Adın" />
      <Field
        label="E-posta"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="ornek@mail.com"
      />
      <Field
        label="Şifre"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="En az 6 karakter"
      />
      {state?.error ? (
        <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-accent font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Kayıt olunuyor…" : "Kayıt ol"}
      </button>
    </form>
  );
}
