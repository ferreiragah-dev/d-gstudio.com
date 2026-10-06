"use client";
import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { portalPost } from "./api";

export function AuthForm({ mode }: { mode: "login" | "forgot" | "reset" }) {
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    setMessage("");
    try {
      const token =
        new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
      const result = await portalPost(`auth/${mode}`, {
        email: fields.get("email"),
        password: fields.get("password"),
        remember: fields.get("remember") === "on",
        token,
      });
      if (result.redirect) {
        if (mode === "reset")
          window.history.replaceState(null, "", window.location.pathname);
        router.replace(result.redirect);
        router.refresh();
      } else setMessage(result.message || "Solicitação recebida.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="portal-form"
      aria-label={
        mode === "login" ? "Acesso do cliente" : "Recuperação de senha"
      }
      aria-busy={pending}
    >
      <fieldset disabled={pending}>
        {mode !== "reset" && (
          <Input
            id="portal-email"
            name="email"
            type="email"
            label="E-mail"
            placeholder="seu@email.com"
            required
            autoComplete="email"
            maxLength={254}
          />
        )}
        {mode !== "forgot" && (
          <div className="portal-password">
            <Input
              id="portal-password"
              name="password"
              type={visible ? "text" : "password"}
              label={mode === "reset" ? "Nova senha" : "Senha"}
              required
              minLength={mode === "reset" ? 12 : 1}
              maxLength={128}
              autoComplete={
                mode === "reset" ? "new-password" : "current-password"
              }
              hint={
                mode === "reset" ? "Use pelo menos 12 caracteres." : undefined
              }
            />
            <button
              type="button"
              className="portal-password-toggle"
              onClick={() => setVisible(!visible)}
              aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}
        {mode === "login" && (
          <div className="portal-form-options">
            <label>
              <input type="checkbox" name="remember" /> Manter conectado
            </label>
            <Link href="/cliente/esqueci-senha">Esqueci minha senha</Link>
          </div>
        )}
        <Button className="portal-submit" type="submit">
          {pending ? (
            <LoaderCircle className="spin" size={18} aria-hidden="true" />
          ) : (
            <ArrowRight size={18} aria-hidden="true" />
          )}
          {pending
            ? "Aguarde…"
            : mode === "login"
              ? "Entrar"
              : mode === "forgot"
                ? "Enviar link de recuperação"
                : "Salvar nova senha"}
        </Button>
      </fieldset>
      {error && (
        <p className="form-feedback feedback-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="form-feedback" role="status">
          {message}
        </p>
      )}
      {mode !== "login" && (
        <Link href="/cliente/login" className="text-link">
          Voltar para o login
        </Link>
      )}
    </form>
  );
}
