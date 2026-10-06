"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Select, Textarea } from "@/components/ui";
import {
  adminEntities,
  projectFields,
  type AdminField,
} from "@/config/portal-admin";
import { statusLabels } from "@/config/portal";
import type { PortalProject, PortalRecord } from "@/types/portal";

type Option = { id: string; name: string };
function AdminForm({
  action,
  fields,
  projectId,
  id,
  entity,
  initial = {},
  relations = {},
  clients = [],
  users = [],
}: {
  action: string;
  fields: AdminField[];
  projectId?: string;
  id?: string;
  entity?: string;
  initial?: Record<string, unknown>;
  relations?: Record<string, Option[]>;
  clients?: Option[];
  users?: Option[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const renderField = (field: AdminField) => {
    const value = String(initial[field.name] ?? "");
    const key = `admin-${action}-${entity || ""}-${id || "new"}-${field.name}`;
    const options =
      field.name === "client_id"
        ? clients
        : field.name === "user_id"
          ? users
          : field.relation
            ? relations[field.relation] || []
            : [];
    if (field.type === "textarea")
      return (
        <Textarea
          key={key}
          id={key}
          name={field.name}
          label={field.label}
          required={!field.optional}
          defaultValue={value}
          maxLength={5000}
        />
      );
    if (field.type === "select")
      return (
        <Select
          key={key}
          id={key}
          name={field.name}
          label={field.label}
          required={!field.optional}
          defaultValue={value || field.options?.[0] || ""}
        >
          <option value="">
            {field.optional ? "Não vincular" : "Selecione"}
          </option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option] || option}
            </option>
          ))}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>
      );
    return (
      <Input
        key={key}
        id={key}
        name={field.name}
        label={field.label}
        type={
          field.name === "password"
            ? "password"
            : field.name === "email"
              ? "email"
              : field.type || "text"
        }
        required={!field.optional}
        defaultValue={value}
        min={field.type === "number" ? 0 : undefined}
        maxLength={field.name === "password" ? 128 : 200}
        minLength={field.name === "password" ? 12 : undefined}
      />
    );
  };
  return (
    <form
      className="portal-form"
      aria-busy={pending}
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setPending(true);
        setError("");
        setSuccess("");
        try {
          const response = await fetch("/api/portal/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action,
              projectId,
              id,
              entity,
              data: {
                ...Object.fromEntries(data),
                can_view_finance: data.get("can_view_finance") === "on",
                remove: data.get("remove") === "on",
              },
            }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message);
          setSuccess(result.message);
          if (!id) form.reset();
          router.refresh();
        } catch (error) {
          setError(error instanceof Error ? error.message : "Tente novamente.");
        } finally {
          setPending(false);
        }
      }}
    >
      <fieldset disabled={pending}>
        <div className="form-grid">{fields.map(renderField)}</div>
        {(action === "user" || action === "membership") && (
          <label className="portal-checkbox">
            <input type="checkbox" name="can_view_finance" />
            Permitir acesso ao financeiro
          </label>
        )}
        {action === "membership" && (
          <label className="portal-checkbox">
            <input type="checkbox" name="remove" />
            Remover vínculo com este cliente
          </label>
        )}
        <Button type="submit">
          {pending ? "Salvando…" : id ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </fieldset>
      {error && (
        <p className="form-feedback feedback-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="form-feedback" role="status">
          {success}
        </p>
      )}
    </form>
  );
}
export function AdminConsole({
  projects,
  clients,
  users,
  project,
  entity,
  records,
  relations,
  activity,
  memberships,
}: {
  projects: PortalProject[];
  clients: Option[];
  users: Option[];
  project?: PortalProject;
  entity: string;
  records: PortalRecord[];
  relations: Record<string, Option[]>;
  activity: PortalRecord[];
  memberships: PortalRecord[];
}) {
  const definition = adminEntities[entity];
  return (
    <div className="portal-stack">
      <div className="portal-page-heading">
        <div>
          <span className="eyebrow">EQUIPE D&G STUDIO</span>
          <h1>Administração do portal</h1>
          <p>
            Publique informações reais para seus clientes. Aprovações e entregas
            mantêm seu histórico.
          </p>
        </div>
      </div>
      <div className="portal-two-columns">
        <section className="portal-card">
          <h2>Clientes e acessos</h2>
          <details>
            <summary>Criar cliente</summary>
            <AdminForm
              action="client"
              fields={[{ name: "name", label: "Empresa ou cliente" }]}
            />
          </details>
          <details>
            <summary>Criar acesso de cliente</summary>
            <AdminForm
              action="user"
              clients={clients}
              fields={[
                { name: "name", label: "Nome" },
                { name: "email", label: "E-mail" },
                { name: "password", label: "Senha inicial" },
                { name: "client_id", label: "Cliente", type: "select" },
              ]}
            />
          </details>
          <details>
            <summary>Gerenciar vínculo e permissões</summary>
            <AdminForm
              action="membership"
              clients={clients}
              users={users}
              fields={[
                { name: "user_id", label: "Usuário", type: "select" },
                { name: "client_id", label: "Cliente", type: "select" },
              ]}
            />
            <ul className="portal-list">
              {memberships.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.user_name} · {item.client_name}
                  </span>
                  <small>
                    {item.can_view_finance
                      ? "Financeiro permitido"
                      : "Sem financeiro"}
                  </small>
                </li>
              ))}
            </ul>
          </details>
        </section>
        <section className="portal-card">
          <h2>Projetos</h2>
          <details>
            <summary>Criar projeto</summary>
            <AdminForm
              action="project"
              clients={clients}
              fields={[
                { name: "client_id", label: "Cliente", type: "select" },
                ...projectFields,
              ]}
            />
          </details>
          <ul className="portal-list">
            {projects.map((item) => (
              <li key={item.id}>
                <Link
                  className="text-link"
                  href={`/equipe?projeto=${item.id}&tipo=${entity}`}
                >
                  {item.name} · {item.client_name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {project && (
        <>
          <section className="portal-card">
            <div className="portal-row portal-between">
              <h2>{project.name}</h2>
              <Link
                href={`/cliente/dashboard?projeto=${project.id}`}
                className="text-link"
              >
                Visualizar portal do cliente
              </Link>
            </div>
            <details>
              <summary>Editar informações e prazos</summary>
              <AdminForm
                action="project"
                id={project.id}
                initial={project}
                fields={projectFields}
              />
            </details>
          </section>
          <nav className="portal-admin-tabs" aria-label="Dados do projeto">
            {Object.entries(adminEntities).map(([key, value]) => (
              <Link
                key={key}
                href={`/equipe?projeto=${project.id}&tipo=${key}`}
                aria-current={key === entity ? "page" : undefined}
              >
                {value.label}
              </Link>
            ))}
            <Link href={`/cliente/solicitacoes?projeto=${project.id}`}>
              Solicitações e respostas
            </Link>
            <Link href={`/cliente/mensagens?projeto=${project.id}`}>
              Mensagens
            </Link>
            <Link href={`/cliente/arquivos?projeto=${project.id}`}>
              Arquivos
            </Link>
            <Link href={`/equipe?projeto=${project.id}&tipo=requests`}>
              Atualizar solicitações
            </Link>
          </nav>
          {definition && (
            <section className="portal-card">
              <h2>{definition.label}</h2>
              <details>
                <summary>Adicionar {definition.label.toLowerCase()}</summary>
                <AdminForm
                  action="entity"
                  entity={entity}
                  projectId={project.id}
                  fields={definition.fields}
                  relations={relations}
                />
              </details>
              {records.map((record) => (
                <details key={record.id}>
                  <summary>
                    {record.title || record.name}{" "}
                    {record.status
                      ? `· ${statusLabels[String(record.status)] || record.status}`
                      : ""}
                  </summary>
                  {definition.editable ? (
                    <AdminForm
                      action="entity"
                      entity={entity}
                      id={record.id}
                      projectId={project.id}
                      initial={record}
                      fields={definition.fields}
                      relations={relations}
                    />
                  ) : (
                    <p className="portal-message-text">
                      {record.description ||
                        "Registro publicado. Crie uma nova versão para preservar o histórico."}
                    </p>
                  )}
                </details>
              ))}
            </section>
          )}
          {entity === "requests" && (
            <section className="portal-card">
              <h2>Atualizar solicitações</h2>
              {records.map((record) => (
                <details key={record.id}>
                  <summary>{record.title}</summary>
                  <AdminForm
                    action="request-status"
                    id={record.id}
                    projectId={project.id}
                    initial={record}
                    fields={[
                      {
                        name: "status",
                        label: "Status",
                        type: "select",
                        options: [
                          "received",
                          "analysis",
                          "approved",
                          "in_progress",
                          "testing",
                          "completed",
                          "rejected",
                          "waiting_client",
                        ],
                      },
                      { name: "owner", label: "Responsável", optional: true },
                      {
                        name: "team_priority",
                        label: "Prioridade da equipe",
                        type: "select",
                        options: ["Baixa", "Normal", "Alta"],
                      },
                    ]}
                  />
                  <Link
                    href={`/cliente/solicitacoes?projeto=${project.id}&item=${record.id}`}
                    className="text-link"
                  >
                    Abrir conversa
                  </Link>
                </details>
              ))}
            </section>
          )}
          <section className="portal-card">
            <h2>Auditoria recente</h2>
            <ul className="portal-list">
              {activity.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.action}</strong>
                    <small>
                      {item.author} ·{" "}
                      {new Date(item.created_at).toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                      })}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
