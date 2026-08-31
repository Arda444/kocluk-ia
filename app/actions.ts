"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EXAM_TYPES, GRADES, TRACKS } from "@/lib/labels";
import { welcomeMessage } from "@/lib/prompt";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ad en az 2 karakter olmalı.").max(80),
  email: z.string().trim().email("Geçerli bir e-posta gir."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı.").max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta gir."),
  password: z.string().min(1, "Şifre gerekli."),
});

const profileSchema = z
  .object({
    displayName: z.string().trim().min(2, "Ad en az 2 karakter olmalı.").max(80),
    examType: z.enum(EXAM_TYPES.map((item) => item.value) as [string, ...string[]]),
    grade: z.enum(GRADES.map((item) => item.value) as [string, ...string[]]),
    track: z.string().optional(),
    dailyHours: z.coerce.number().min(0.5, "En az 0.5 saat.").max(16, "En fazla 16 saat."),
    target: z.string().trim().min(3, "Hedefini yaz.").max(200),
    weakSubjects: z.string().trim().min(2, "Zorlandığın dersi yaz.").max(200),
  })
  .superRefine((data, ctx) => {
    if (data.examType === "YKS") {
      const ok = TRACKS.some((item) => item.value === data.track);
      if (!ok) {
        ctx.addIssue({
          code: "custom",
          path: ["track"],
          message: "YKS için alan seç.",
        });
      }
    }
  });

export type ActionState = { error?: string } | undefined;

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formu kontrol et." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Bu e-posta zaten kayıtlı. Giriş yapmayı dene." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Kayıt oldu ama giriş yapılamadı. Giriş sayfasını dene." };
    }
    throw error;
  }
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formu kontrol et." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/chat",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-posta veya şifre hatalı." };
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function saveProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Oturum gerekli." };
  }

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    examType: formData.get("examType"),
    grade: formData.get("grade"),
    track: formData.get("track") || undefined,
    dailyHours: formData.get("dailyHours"),
    target: formData.get("target"),
    weakSubjects: formData.get("weakSubjects"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formu kontrol et." };
  }

  const track = parsed.data.examType === "YKS" ? parsed.data.track ?? null : null;

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      displayName: parsed.data.displayName,
      examType: parsed.data.examType,
      grade: parsed.data.grade,
      track,
      dailyHours: parsed.data.dailyHours,
      target: parsed.data.target,
      weakSubjects: parsed.data.weakSubjects,
    },
    update: {
      displayName: parsed.data.displayName,
      examType: parsed.data.examType,
      grade: parsed.data.grade,
      track,
      dailyHours: parsed.data.dailyHours,
      target: parsed.data.target,
      weakSubjects: parsed.data.weakSubjects,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.displayName },
  });

  redirect("/chat");
}

export async function createConversationAction() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    redirect("/onboarding");
  }

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      title: "Yeni sohbet",
      messages: {
        create: {
          role: "assistant",
          content: welcomeMessage(profile),
        },
      },
    },
  });

  revalidatePath("/chat");
  redirect(`/chat/${conversation.id}`);
}
