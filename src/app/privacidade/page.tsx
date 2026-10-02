import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { ButtonLink, Container } from "@/components/ui";
import { siteConfig } from "@/config/site";
export const metadata: Metadata = {
  title: "Privacidade",
  ...(siteConfig.url ? { alternates: { canonical: "/privacidade" } } : {}),
};
export default function Privacy() {
  return (
    <>
      <main className="privacy-page">
        <Container>
          <Link href="/" aria-label="Voltar à D&G Studio">
            <Logo />
          </Link>
          <span className="eyebrow">SEUS DADOS, COM CUIDADO</span>
          <h1>Privacidade</h1>
          <p>
            Esta página explica como o formulário de orçamento da D&G Studio
            utiliza suas informações.
          </p>
          <h2>Informações do formulário</h2>
          <p>
            Solicitamos nome, empresa (opcional), e-mail, WhatsApp e detalhes do
            projeto para entender sua necessidade e responder ao pedido de
            orçamento. Não inclua senhas, dados financeiros ou informações
            sensíveis na descrição.
          </p>
          <h2>Envio e uso</h2>
          <p>
            Quando o envio está disponível, os dados são encaminhados ao serviço
            de atendimento configurado pela D&G Studio para tratar sua
            solicitação. Eles não são usados por este site para publicidade ou
            venda de listas.
          </p>
          <p>
            Quando o formulário informa que o envio direto não está disponível,
            a solicitação é apenas validada pelo site, sem ser encaminhada ao
            atendimento ou armazenada pela aplicação. Você pode baixar um resumo
            local no seu dispositivo. Nenhum recebimento é confirmado nesse
            modo.
          </p>
          <h2>Armazenamento no navegador</h2>
          <p>
            Este site não utiliza cookies de publicidade ou ferramentas de
            análise. O formulário mantém as informações apenas enquanto a página
            permanece aberta; o arquivo baixado fica sob seu controle.
          </p>
          <h2>Contato sobre seus dados</h2>
          <p>
            Para solicitar informações, correção ou exclusão de dados enviados,
            utilize{" "}
            {siteConfig.email ? (
              <Link href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </Link>
            ) : (
              "os canais de atendimento disponibilizados pela D&G Studio"
            )}
            . Se o envio estiver indisponível, aguarde a disponibilização de um
            canal de atendimento antes de compartilhar dados pessoais.
          </p>
          <ButtonLink href="/" arrow>
            Voltar ao site
          </ButtonLink>
        </Container>
      </main>
      <Footer />
    </>
  );
}
