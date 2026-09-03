"use server";

import { z } from "zod";
import { getAppUser } from "@/lib/app-user";
import { prisma } from "@/lib/prisma";
import { EXAM_TYPES, GRADES, PLATFORMS, TRACKS } from "@/lib/labels";
import { welcomeMessage } from "@/lib/prompt";
import { istanbulToday } from "@/lib/dates";
import { defaultProgramStart, TYT_PROGRAM } from "@/lib/allstar-tyt";
import { insertProgram } from "@/lib/ensure-program";
import { normalizePlatform } from "@/lib/labels";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

function revalidateStudy() {
  revalidatePath("/calendar");
  revalidatePath("/chat");
  revalidatePath("/program");
  revalidatePath("/stats");
  revalidatePath("/notes");
  revalidatePath("/todos");
}

export async function saveProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAppUser();
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
    where: { userId: user.id },
    create: {
      userId: user.id,
      displayName: parsed.data.displayName,
      examType: parsed.data.examType,
      grade: parsed.data.grade,
      track,
      platform: normalizePlatform(parsed.data.platform),
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
      platform: normalizePlatform(parsed.data.platform),
      platformNote,
      dailyHours: parsed.data.dailyHours,
      target: parsed.data.target ?? "",
      weakSubjects: parsed.data.weakSubjects,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.displayName },
  });

  redirect("/program");
}

export async function createConversationAction() {
  const user = await getAppUser();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    redirect("/onboarding");
  }

  const today = istanbulToday();
  const todayTasks = await prisma.studyTask.findMany({
    where: { userId: user.id, date: today },
    orderBy: { createdAt: "asc" },
  });

  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: "Koç",
      messages: {
        create: {
          role: "assistant",
          content: welcomeMessage(profile, todayTasks),
        },
      },
    },
  });

  revalidatePath("/chat");
  redirect(`/chat/${conversation.id}`);
}

export async function deleteConversationAction(conversationId: string) {
  const user = await getAppUser();
  await prisma.conversation.deleteMany({
    where: { id: conversationId, userId: user.id },
  });
  revalidatePath("/chat");
  revalidatePath("/calendar");
  redirect("/chat");
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const user = await getAppUser();
  const parsed = taskSchema.safeParse({
    date: formData.get("date"),
    title: formData.get("title"),
    subject: formData.get("subject") || undefined,
    minutes: formData.get("minutes") || 40,
  });
  if (!parsed.success) return;

  await prisma.studyTask.create({
    data: {
      userId: user.id,
      date: parsed.data.date,
      title: parsed.data.title,
      subject: parsed.data.subject ?? "",
      minutes: parsed.data.minutes,
    },
  });
  revalidateStudy();
}

export async function toggleTaskAction(taskId: string) {
  const user = await getAppUser();
  const task = await prisma.studyTask.findFirst({
    where: { id: taskId, userId: user.id },
  });
  if (!task) return;
  await prisma.studyTask.update({
    where: { id: task.id },
    data: { done: !task.done },
  });
  revalidateStudy();
}

export async function updateTaskAction(formData: FormData): Promise<void> {
  const user = await getAppUser();
  const id = String(formData.get("id") ?? "");
  const parsed = taskSchema.safeParse({
    date: formData.get("date"),
    title: formData.get("title"),
    subject: formData.get("subject") || undefined,
    minutes: formData.get("minutes") || 40,
  });
  if (!parsed.success) return;

  const task = await prisma.studyTask.findFirst({
    where: { id, userId: user.id },
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
  revalidateStudy();
}

export async function deleteTaskAction(taskId: string) {
  const user = await getAppUser();
  await prisma.studyTask.deleteMany({
    where: { id: taskId, userId: user.id },
  });
  revalidateStudy();
}

export async function saveElapsedAction(taskId: string, elapsedSeconds: number, refresh = false): Promise<void> {
  const user = await getAppUser();
  const seconds = Math.max(0, Math.floor(elapsedSeconds));
  if (!taskId || seconds > 60 * 60 * 16) return;
  const task = await prisma.studyTask.findFirst({
    where: { id: taskId, userId: user.id },
  });
  if (!task) return;
  await prisma.studyTask.update({
    where: { id: task.id },
    data: { elapsedSeconds: seconds },
  });
  if (refresh) revalidateStudy();
}

const scoreSchema = z.object({
  id: z.string().min(1),
  correct: z.coerce.number().int().min(0).max(200),
  wrong: z.coerce.number().int().min(0).max(200),
  blank: z.coerce.number().int().min(0).max(200),
  note: z.string().optional(),
});

export async function logTaskResultAction(formData: FormData): Promise<void> {
  const user = await getAppUser();
  const notePresent = formData.has("note");
  const parsed = scoreSchema.safeParse({
    id: formData.get("id"),
    correct: formData.get("correct") || 0,
    wrong: formData.get("wrong") || 0,
    blank: formData.get("blank") || 0,
    note: notePresent ? String(formData.get("note") ?? "") : undefined,
  });
  if (!parsed.success) return;

  const task = await prisma.studyTask.findFirst({
    where: { id: parsed.data.id, userId: user.id },
  });
  if (!task) return;

  const scored = parsed.data.correct + parsed.data.wrong + parsed.data.blank > 0;
  await prisma.studyTask.update({
    where: { id: task.id },
    data: {
      correct: parsed.data.correct,
      wrong: parsed.data.wrong,
      blank: parsed.data.blank,
      note: notePresent ? (parsed.data.note ?? "").trim().slice(0, 300) : task.note,
      done: scored ? true : task.done,
    },
  });
  revalidateStudy();
}

export async function seedAllStarProgramAction(formData: FormData): Promise<void> {
  const user = await getAppUser();
  const raw =
    String(formData.get("startDate") ?? "").slice(0, 10) || defaultProgramStart();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return;

  const existing = await prisma.studyTask.count({
    where: { userId: user.id, source: TYT_PROGRAM.source },
  });
  if (existing > 0) {
    redirect("/program");
  }

  await insertProgram(user.id, raw);

  await prisma.profile.updateMany({
    where: { userId: user.id },
    data: {
      examType: "YKS",
      platform: "kaynak345",
      platformNote: "345 All Star TYT konu + veri bankası",
      dailyHours: 4,
    },
  });

  revalidateStudy();
  redirect("/program");
}

export async function resetAllStarProgramAction(): Promise<void> {
  const user = await getAppUser();
  await prisma.studyTask.deleteMany({
    where: { userId: user.id, source: TYT_PROGRAM.source },
  });
  revalidateStudy();
  redirect("/program");
}

const STICKY_COLORS = ["yellow", "pink", "mint", "blue", "lavender"] as const;

export async function createStickyNoteAction(formData: FormData): Promise<void> {
  const user = await getAppUser();
  const body = String(formData.get("body") ?? "").trim().slice(0, 400);
  const colorRaw = String(formData.get("color") ?? "yellow");
  const color = STICKY_COLORS.includes(colorRaw as (typeof STICKY_COLORS)[number]) ? colorRaw : "yellow";
  if (!body) return;
  await prisma.stickyNote.create({
    data: { userId: user.id, body, color },
  });
  revalidatePath("/notes");
}

export async function updateStickyNoteAction(formData: FormData): Promise<void> {
  const user = await getAppUser();
  const id = String(formData.get("id") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 400);
  if (!id || !body) return;
  await prisma.stickyNote.updateMany({
    where: { id, userId: user.id },
    data: { body },
  });
  revalidatePath("/notes");
}

export async function deleteStickyNoteAction(noteId: string): Promise<void> {
  const user = await getAppUser();
  await prisma.stickyNote.deleteMany({
    where: { id: noteId, userId: user.id },
  });
  revalidatePath("/notes");
}

export async function createTodoAction(formData: FormData): Promise<void> {
  const user = await getAppUser();
  const title = String(formData.get("title") ?? "").trim().slice(0, 140);
  if (!title) return;
  await prisma.todoItem.create({
    data: { userId: user.id, title },
  });
  revalidatePath("/todos");
}

export async function toggleTodoAction(todoId: string): Promise<void> {
  const user = await getAppUser();
  const todo = await prisma.todoItem.findFirst({
    where: { id: todoId, userId: user.id },
  });
  if (!todo) return;
  await prisma.todoItem.update({
    where: { id: todo.id },
    data: { done: !todo.done },
  });
  revalidatePath("/todos");
}

export async function deleteTodoAction(todoId: string): Promise<void> {
  const user = await getAppUser();
  await prisma.todoItem.deleteMany({
    where: { id: todoId, userId: user.id },
  });
  revalidatePath("/todos");
}
