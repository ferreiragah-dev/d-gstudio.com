import { AuthForm } from "@/components/portal/auth-form";
export default function ResetPage() {
  return (
    <>
      <span className="eyebrow">ACESSO AO PORTAL</span>
      <h1>Defina sua nova senha</h1>
      <p>Escolha uma senha longa e exclusiva para sua área de projeto.</p>
      <AuthForm mode="reset" />
    </>
  );
}
