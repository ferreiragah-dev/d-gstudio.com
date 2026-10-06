"use client";
import { Button, ButtonLink } from "@/components/ui";
export default function PortalError({
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <main className="portal-empty">
      <h1>Sua área está temporariamente indisponível</h1>
      <p>
        Não conseguimos carregar as informações agora. Seus dados estão
        preservados.
      </p>
      <div className="portal-row">
        <Button onClick={() => retry()}>Tentar novamente</Button>
        <ButtonLink href="/" variant="secondary">
          Voltar ao site
        </ButtonLink>
      </div>
    </main>
  );
}
