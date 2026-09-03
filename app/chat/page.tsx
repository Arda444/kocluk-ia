import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/app-user";
import { getOrCreateCoachConversation } from "@/lib/coach";

export default async function ChatIndexPage() {
  const user = await getAppUser();
  const id = await getOrCreateCoachConversation(user.id);
  if (!id) redirect("/onboarding");
  redirect(`/chat/${id}`);
}
