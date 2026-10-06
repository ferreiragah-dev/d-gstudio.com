import { AuthForm } from "@/components/portal/auth-form";
export default function LoginPage() {
  return (
    <>
      <span className="eyebrow">SUA ÁREA EXCLUSIVA</span>
      <h1>Acompanhe seu projeto</h1>
      <p>
        Acesse sua área exclusiva para acompanhar o desenvolvimento, aprovar
        etapas, visualizar entregas e conversar com nossa equipe.
      </p>
      <AuthForm mode="login" />
    </>
  );
}
