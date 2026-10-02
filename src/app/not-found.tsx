import { ButtonLink, Container } from "@/components/ui";
export default function NotFound() {
  return (
    <main className="not-found">
      <Container>
        <span className="eyebrow">404 · CAMINHO NÃO ENCONTRADO</span>
        <h1>
          Vamos voltar
          <br />
          ao início?
        </h1>
        <p>A página que você procura não está disponível.</p>
        <ButtonLink href="/" arrow>
          Conheça a D&G Studio
        </ButtonLink>
      </Container>
    </main>
  );
}
