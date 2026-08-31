"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { auth, signIn, signOut } from "@/auth";
import { dbErrorMessage, ensureSchema, prisma } from "@/lib/prisma";
import { EXAM_TYPES, GRADES, PLATFORMS, TRACKS } from "@/lib/labels";
import { welcomeMessage } from "@/lib/prompt";
import { istanbulNowLabel, istanbulToday } from "@/lib/dates";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ad en az 2 karakter olmalı.").max(80),
  email: z.string().trim().email("Geçerli bir e-posta gir."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı.").max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta gir."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
});

const profileSchema = z
  .object({
    displayName: z.string().trim().min(2, "Ad en az 2 karakter olmalı.").max(80),
    examType: z.enum(EXAM_TYPES.map((item) => item.value) as [string, ...string[]]),
    grade: z.enum(GRADES.map((item) => item.value) as [string, ...string[]]),
    track: z.string().optional(),
    platform: z.enum(PLATFORMS.map((item) => item.value) as [string, ...string[]]),
    platformNote: z.string().trim().max(200).optional(),
    dailyHours: z.coerce.number().min(0.5, "En az 0.5 saat.").max(16, "En fazla 16 saat."),
    target: z.string().trim().max(200).optional(),
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
    if (data.platform === "other" && !data.platformNote) {
      ctx.addIssue({
        code: "custom",
        path: ["platformNote"],
        message: "Kullandığın kaynağı yaz.",
      });
    }
  });

const taskSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().trim().min(2).max(200),
  subject: z.string().trim().max(80).optional(),
  minutes: z.coerce.number().min(10).max(300),
});

export type ActionState = { error?: string } | undefined;

async function credentialsSignIn(email: string, password: string, redirectTo: string) {
  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error:
            "E-posta veya şifre hatalı. Canlı sitede yerel hesap durmaz — bu siteden yeniden kayıt ol.",
        };
      }
      if (error.type === "MissingSecret") {
        return { error: "AUTH_SECRET Vercel’de yok. Environment Variables’a ekleyip Redeploy yap." };
      }
      return { error: `Giriş yapılamadı (${error.type}). AUTH_URL localhost olmamalı.` };
    }
    return { error: dbErrorMessage(error) };
  }
}

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
  try {
    await ensureSchema();
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
  } catch (error) {
    return { error: dbErrorMessage(error) };
  }

  return credentialsSignIn(email, parsed.data.password, "/onboarding");
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
    await ensureSchema();
  } catch (error) {
    return { error: dbErrorMessage(error) };
  }

  return credentialsSignIn(
    parsed.data.email.toLowerCase(),
    parsed.data.password,
    "/chat",
  );
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function saveProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Oturum gerekli." };
  }

  await ensureSchema();

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    examType: formData.get("examType"),
    grade: formData.get("grade"),
    track: formData.get("track") || undefined,
    platform: formData.get("platform"),
    platformNote: formData.get("platformNote") || undefined,
    dailyHours: formData.get("dailyHours"),
    target: formData.get("target") || undefined,
    weakSubjects: formData.get("weakSubjects"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formu kontrol et." };
  }

  const track = parsed.data.examType === "YKS" ? parsed.data.track ?? null : null;
  const platformNote =
    parsed.data.platform === "other" || parsed.data.platformNote
      ? parsed.data.platformNote ?? ""
      : "";

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      displayName: parsed.data.displayName,
      examType: parsed.data.examType,
      grade: parsed.data.grade,
      track,
      platform: parsed.data.platform,
      platformNote,
      dailyHours: parsed.data.dailyHours,
      target: parsed.data.target ?? "",
      weakSubjects: parsed.data.weakSubjects,
    },
    update: {
      displayName: parsed.data.displayName,
      examType: parsed.data.examType,
      grade: parsed.data.grade,
      track,
      platform: parsed.data.platform,
      platformNote,
      dailyHours: parsed.data.dailyHours,
      target: parsed.data.target ?? "",
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

  const today = istanbulToday();
  const todayTasks = await prisma.studyTask.findMany({
    where: { userId: session.user.id, date: today },
    orderBy: { createdAt: "asc" },
  });

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      title: "Yeni sohbet",
      messages: {
        create: {
          role: "assistant",
          content: welcomeMessage(profile, todayTasks, istanbulNowLabel()),
        },
      },
    },
  });

  revalidatePath("/chat");
  redirect(`/chat/${conversation.id}`);
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const parsed = taskSchema.safeParse({
    date: formData.get("date"),
    title: formData.get("title"),
    subject: formData.get("subject") || undefined,
    minutes: formData.get("minutes") || 40,
  });
  if (!parsed.success) return;

  await prisma.studyTask.create({
    data: {
      userId: session.user.id,
      date: parsed.data.date,
      title: parsed.data.title,
      subject: parsed.data.subject ?? "",
      minutes: parsed.data.minutes,
    },
  });
  revalidatePath("/calendar");
  revalidatePath("/chat");
}

export async function toggleTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  const task = await prisma.studyTask.findFirst({
    where: { id: taskId, userId: session.user.id },
  });
  if (!task) return;
  await prisma.studyTask.update({
    where: { id: task.id },
    data: { done: !task.done },
  });
  revalidatePath("/calendar");
  revalidatePath("/chat");
}

export async function updateTaskAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const id = String(formData.get("id") ?? "");
  const parsed = taskSchema.safeParse({
    date: formData.get("date"),
    title: formData.get("title"),
    subject: formData.get("subject") || undefined,
    minutes: formData.get("minutes") || 40,
  });
  if (!parsed.success) return;

  const task = await prisma.studyTask.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!task) return;

  await prisma.studyTask.update({
    where: { id },
    data: {
      date: parsed.data.date,
      title: parsed.data.title,
      subject: parsed.data.subject ?? "",
      minutes: parsed.data.minutes,
    },
  });
  revalidatePath("/calendar");
  revalidatePath("/chat");
}

export async function deleteTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.studyTask.deleteMany({
    where: { id: taskId, userId: session.user.id },
  });
  revalidatePath("/calendar");
  revalidatePath("/chat");
}
