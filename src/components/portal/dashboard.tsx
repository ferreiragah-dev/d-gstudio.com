import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Layers3,
  Clock3,
} from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { projectProgress, scheduleState } from "@/config/portal";
import type { PortalProject, PortalUser, SectionData } from "@/types/portal";
import {
  dateLabel,
  EmptyState,
  moneyLabel,
  ProjectProgress,
  ProjectStepper,
  ProjectTimeline,
  StatusBadge,
} from "./project-components";
import { RequestDialog, Welcome } from "./actions";
export function Dashboard({
  user,
  project,
  data,
}: {
  user: PortalUser;
  project: PortalProject;
  data: SectionData;
}) {
  const phases = data.phases || [];
  const active = phases.find(
    (phase) => phase.status === "in_progress" || phase.status === "blocked",
  );
  const upcoming = (data.milestones || []).filter(
    (item) => item.status !== "completed",
  );
  const next = upcoming[0];
  const approval = data.approvals?.[0];
  const progress = projectProgress(phases);
  const schedule = scheduleState(project.due_on, project.status, phases);
  const link = (section: string) => `/cliente/${section}?projeto=${project.id}`;
  const payments = data.payments || [];
  const total = payments.reduce(
    (sum, item) => sum + Number(item.amount_cents),
    0,
  );
  const paid = payments
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + Number(item.amount_cents), 0);
  return (
    <div className="portal-stack">
      <div className="portal-page-heading">
        <div>
          <span className="eyebrow">VISÃO GERAL</span>
          <h1>
            Olá, {user.name.split(" ")[0]} <span aria-hidden="true">👋</span>
          </h1>
          <p>Acompanhe abaixo o andamento do seu projeto.</p>
        </div>
        <RequestDialog projectId={project.id} />
      </div>
      <div className="portal-row portal-between">
        <h2>{project.name}</h2>
        <StatusBadge status={project.status} />
      </div>
      {approval ? (
        <section className="portal-card portal-action-needed">
          <span className="eyebrow">AÇÃO NECESSÁRIA</span>
          <h2>Precisamos da sua aprovação para continuar</h2>
          <p>
            {approval.title} · {approval.version}
          </p>
          <ButtonLink href={link("aprovacoes")}>
            Revisar agora <ArrowUpRight size={16} />
          </ButtonLink>
        </section>
      ) : active?.status === "blocked" ? (
        <section className="portal-card portal-action-needed">
          <span className="eyebrow">AÇÃO NECESSÁRIA</span>
          <h2>{active.title}</h2>
          <p>
            {active.notes ||
              "Há um impedimento nesta etapa. Fale com nossa equipe para entender o próximo passo."}
          </p>
          <ButtonLink href={link("mensagens")}>
            Conversar com a equipe
          </ButtonLink>
        </section>
      ) : null}
      <div className="portal-stats">
        <article className="portal-card">
          <CheckCircle2 />
          <small>Progresso geral</small>
          <strong>{progress}%</strong>
          <span>
            {phases.filter((phase) => phase.status === "completed").length} de{" "}
            {phases.length} etapas concluídas
          </span>
        </article>
        <article className="portal-card">
          <Layers3 />
          <small>Etapa atual</small>
          <strong>
            {active?.title || (progress === 100 ? "Concluído" : "A definir")}
          </strong>
          <span>{active?.owner || "Equipe D&G Studio"}</span>
        </article>
        <article className="portal-card">
          <Clock3 />
          <small>Próxima entrega</small>
          <strong>{next?.title || "A definir"}</strong>
          <span>{dateLabel(next?.due_on as string)}</span>
        </article>
        <article className="portal-card">
          <CalendarDays />
          <small>Previsão de conclusão</small>
          <strong>{dateLabel(project.due_on)}</strong>
          <span>{schedule}</span>
        </article>
      </div>
      <ProjectProgress phases={phases} updatedAt={project.updated_at} />
      {!user.welcomed_at && <Welcome />}
      <div className="portal-two-columns">
        <section className="portal-card">
          <div className="portal-row portal-between">
            <h2>Etapas do seu projeto</h2>
            <Link href={link("etapas")} className="text-link">
              Ver detalhes
            </Link>
          </div>
          <ProjectStepper phases={phases} tasks={data.tasks} />
        </section>
        <div className="portal-stack">
          <section className="portal-card">
            <span className="eyebrow">PRÓXIMA AÇÃO</span>
            <h2>
              {approval
                ? "Estamos aguardando você"
                : "O que estamos fazendo agora"}
            </h2>
            <p>
              {approval?.title ||
                active?.title ||
                "O planejamento do projeto será publicado pela equipe."}
            </p>
            <small className="portal-muted">
              Previsão: {dateLabel(active?.due_on)}
            </small>
            <Link
              className="text-link"
              href={link(approval ? "aprovacoes" : "cronograma")}
            >
              {approval ? "Revisar aprovação" : "Acompanhar cronograma"}
              <ArrowUpRight size={15} />
            </Link>
          </section>
          <section className="portal-card">
            <h2>Próximas entregas</h2>
            {upcoming.length ? (
              <ul className="portal-list">
                {upcoming.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{dateLabel(String(item.due_on))}</small>
                    </div>
                    <StatusBadge status={String(item.status)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="portal-muted">
                As próximas entregas aparecerão quando o cronograma for
                definido.
              </p>
            )}
          </section>
          <section className="portal-card">
            <h2>Status do cronograma</h2>
            <p
              className={
                schedule === "Atrasado" || schedule === "Atenção"
                  ? "portal-warning"
                  : "portal-muted"
              }
            >
              {schedule}
            </p>
            <Link className="text-link" href={link("cronograma")}>
              Ver cronograma completo
            </Link>
          </section>
        </div>
      </div>
      {data.deliveries?.[0]?.url && (
        <section className="portal-card portal-release">
          <div>
            <span className="eyebrow">VERSÃO DISPONÍVEL</span>
            <h2>
              {data.deliveries[0].title} · {data.deliveries[0].version}
            </h2>
            <p>Publicada em {dateLabel(data.deliveries[0].created_at, true)}</p>
          </div>
          <div className="portal-row">
            <ButtonLink
              href={String(data.deliveries[0].url)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir homologação
            </ButtonLink>
            <RequestDialog
              projectId={project.id}
              title="Reportar problema"
              initialCategory="Bug"
              initialModule={String(data.deliveries[0].version)}
            />
          </div>
        </section>
      )}
      <div className="portal-two-columns">
        <section className="portal-card">
          <h2>Últimas atualizações</h2>
          <ProjectTimeline items={data.items} />
          <Link href={link("atualizacoes")} className="text-link">
            Ver histórico completo
          </Link>
        </section>
        <div className="portal-stack">
          <section className="portal-card">
            <h2>Última mensagem da equipe</h2>
            {data.lastMessage ? (
              <>
                <p className="portal-message-text">
                  {data.lastMessage.message}
                </p>
                <small className="portal-muted">
                  {data.lastMessage.author} ·{" "}
                  {dateLabel(data.lastMessage.created_at, true)}
                </small>
              </>
            ) : (
              <p className="portal-muted">
                Nossa equipe ainda não publicou mensagens.
              </p>
            )}
            <Link className="text-link" href={link("mensagens")}>
              Conversar com a equipe
            </Link>
          </section>
          <section className="portal-card">
            <h2>Suas solicitações</h2>
            {data.requests?.length ? (
              <ul className="portal-list">
                {data.requests.map((item) => (
                  <li key={item.id}>
                    <Link href={`${link("solicitacoes")}&item=${item.id}`}>
                      {item.title}
                    </Link>
                    <StatusBadge status={String(item.status)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="portal-muted">Nenhuma solicitação ainda.</p>
            )}
            <Link className="text-link" href={link("solicitacoes")}>
              Ver solicitações
            </Link>
          </section>
          <section className="portal-card">
            <h2>Sua equipe</h2>
            {data.team?.length ? (
              <ul className="portal-team">
                {data.team.map((member) => (
                  <li key={member.id}>
                    <span className="portal-avatar" aria-hidden="true">
                      {String(member.name).slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <strong>{member.name}</strong>
                      <small>{member.role}</small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="portal-muted">
                Os responsáveis serão apresentados aqui.
              </p>
            )}
          </section>
          {project.can_view_finance && (
            <section className="portal-card">
              <h2>Resumo financeiro</h2>
              {payments.length ? (
                <dl className="portal-definition">
                  <div>
                    <dt>Valor do projeto</dt>
                    <dd>{moneyLabel(total)}</dd>
                  </div>
                  <div>
                    <dt>Pago</dt>
                    <dd>{moneyLabel(paid)}</dd>
                  </div>
                  <div>
                    <dt>Restante</dt>
                    <dd>{moneyLabel(total - paid)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="portal-muted">Parcelas ainda não cadastradas.</p>
              )}
              <Link className="text-link" href={link("financeiro")}>
                Ver financeiro
              </Link>
            </section>
          )}
        </div>
      </div>
      {!phases.length && !data.items.length && (
        <EmptyState
          title="Seu projeto está em preparação"
          description="Assim que a equipe definir as primeiras etapas, você acompanhará o andamento por aqui."
        />
      )}
    </div>
  );
}
