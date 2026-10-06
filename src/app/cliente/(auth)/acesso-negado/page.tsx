import { ButtonLink } from "@/components/ui";
export default function DeniedPage() {
  return (
    <>
      <h1>Acesso não permitido</h1>
      <p>
        Seu usuário não possui permissão para visualizar estas informações. Fale
        com nossa equipe se precisar de acesso.
      </p>
      <ButtonLink href="/cliente/dashboard">Voltar à minha área</ButtonLink>
    </>
  );
}
