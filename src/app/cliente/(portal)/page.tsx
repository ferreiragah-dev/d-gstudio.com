import { redirect } from "next/navigation";
import { pageUser } from "@/utils/portal/auth";
export default async function ClientHome() {
  const user = await pageUser();
  if (user.role === "team") redirect("/equipe");
  redirect("/cliente/dashboard");
}
