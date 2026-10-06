import { AuthForm } from "@/components/portal/auth-form";
export default function ForgotPage() {
  return (
    <>
      <span className="eyebrow">ACESSO AO PORTAL</span>
      <h1>Esqueceu sua senha?</h1>
      <p>
        Informe o e-mail do seu acesso. Enviaremos um link para você definir uma
        nova senha.
      </p>
      <AuthForm mode="forgot" />
    </>
  );
}
