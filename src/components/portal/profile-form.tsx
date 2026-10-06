"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import type { PortalUser } from "@/types/portal";
import { portalPost } from "./api";
export function ProfileForm({
  user,
  companies,
}: {
  user: PortalUser;
  companies: string[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  return (
    <form
      className="portal-form portal-card"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        setError("");
        setSuccess("");
        try {
          const result = await portalPost("profile", {
            ...Object.fromEntries(data),
            notifications_enabled: data.get("notifications_enabled") === "on",
          });
          setSuccess(result.message || "Dados salvos.");
          if (result.redirect) router.replace(result.redirect);
          router.refresh();
        } catch (error) {
          setError(error instanceof Error ? error.message : "Tente novamente.");
        } finally {
          setPending(false);
        }
      }}
    >
      <fieldset disabled={pending}>
        <div className="form-grid">
          <Input
            id="profile-name"
            name="name"
            label="Nome"
            defaultValue={user.name}
            required
            maxLength={100}
          />
          <Input
            id="profile-email"
            label="E-mail de acesso"
            defaultValue={user.email}
            readOnly
            hint="Para alterar, fale com nossa equipe."
          />
          <Input
            id="profile-phone"
            name="phone"
            label="Telefone"
            defaultValue={user.phone}
            maxLength={24}
          />
          <Input
            id="profile-company"
            label="Empresa"
            value={companies.join(", ") || "Não vinculada"}
            readOnly
          />
        </div>
        <h2>Alterar senha</h2>
        <Input
          id="profile-current-password"
          name="currentPassword"
          label="Senha atual"
          type="password"
          autoComplete="current-password"
        />
        <Input
          id="profile-new-password"
          name="password"
          label="Nova senha (opcional)"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          hint="Preencha apenas se quiser trocar sua senha. Todas as sessões serão encerradas."
        />
        <label className="portal-checkbox">
          <input
            type="checkbox"
            name="notifications_enabled"
            defaultChecked={user.notifications_enabled}
          />
          Receber notificações do projeto no portal
        </label>
        <Button type="submit">
          {pending ? "Salvando…" : "Salvar meus dados"}
        </Button>
      </fieldset>
      {error && (
        <p role="alert" className="form-feedback feedback-error">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="form-feedback">
          {success}
        </p>
      )}
    </form>
  );
}
