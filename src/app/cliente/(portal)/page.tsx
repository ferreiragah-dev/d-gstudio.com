import { redirect } from "next/navigation";
import { pageUser } from "@/utils/portal/auth";
export default async function ClientHome() {
  await pageUser();
  redirect("/cliente/dashboard");
}
