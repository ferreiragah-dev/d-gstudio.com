"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { Button, Input, Select, Textarea } from "./ui";
import {
  budgets,
  deadlines,
  projectTypes,
  quoteSchema,
  type QuoteData,
  type QuoteResult,
} from "@/utils/quote-schema";
import { downloadQuote, submitQuote } from "@/utils/submit-quote";

export function QuoteForm({ deliveryEnabled }: { deliveryEnabled: boolean }) {
  const form = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState("");
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [draft, setDraft] = useState<QuoteData | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeField = form.current?.elements.namedItem(
      "projectType",
    ) as HTMLSelectElement | null;
    const planField = form.current?.elements.namedItem(
      "plan",
    ) as HTMLInputElement | null;
    const type = params.get("tipo");
    const plan = params.get("plano");
    if (
      typeField &&
      projectTypes.includes(type as (typeof projectTypes)[number])
    )
      typeField.value = type!;
    if (
      planField &&
      plan &&
      ["Essencial", "Profissional", "Personalizado"].includes(plan)
    )
      planField.value = plan;
  }, []);
  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const fields = new FormData(event.currentTarget);
    const parsed = quoteSchema.safeParse({
      ...Object.fromEntries(fields),
      consent: fields.get("consent") === "on",
    });
    setFailure("");
    setResult(null);
    if (!parsed.success) {
      const nextErrors = Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      );
      setErrors(nextErrors);
      const firstField = form.current?.elements.namedItem(
        String(parsed.error.issues[0].path[0]),
      );
      if (firstField instanceof HTMLElement) firstField.focus();
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const response = await submitQuote(parsed.data);
      setResult(response);
      if (response.status === "draft") setDraft(parsed.data);
      else {
        form.current?.reset();
        setDraft(null);
      }
    } catch (error) {
      setFailure(
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "A conexão demorou mais que o esperado. Seus dados estão preservados; tente novamente.",
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <form
      ref={form}
      className="quote-form"
      onSubmit={onSubmit}
      noValidate
      aria-label="Formulário de orçamento"
      aria-busy={sending}
    >
      <div className="form-heading">
        <span>Vamos conhecer sua ideia.</span>
        <small>* Campos obrigatórios</small>
      </div>
      {!deliveryEnabled && (
        <p className="form-notice">
          Você pode preparar e baixar um resumo do projeto. O envio direto ainda
          não está disponível.
        </p>
      )}
      <fieldset disabled={sending}>
        <legend className="sr-only">
          Informações sobre você e seu projeto
        </legend>
        <div className="form-grid">
          <Input
            id="name"
            name="name"
            label="Nome"
            placeholder="Como você se chama?"
            autoComplete="name"
            maxLength={100}
            required
            error={errors.name}
          />
          <Input
            id="company"
            name="company"
            label="Empresa"
            placeholder="Nome da empresa (opcional)"
            autoComplete="organization"
            maxLength={150}
            error={errors.company}
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="E-mail"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            maxLength={254}
            required
            error={errors.email}
          />
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            label="WhatsApp"
            placeholder="(00) 00000-0000"
            autoComplete="tel"
            maxLength={24}
            required
            error={errors.whatsapp}
          />
          <Select
            id="projectType"
            name="projectType"
            label="Tipo de projeto"
            defaultValue=""
            required
            error={errors.projectType}
          >
            <option value="" disabled>
              Selecione uma opção
            </option>
            {projectTypes.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
          <Select
            id="existingSite"
            name="existingSite"
            label="Possui site atualmente?"
            defaultValue=""
            required
            error={errors.existingSite}
          >
            <option value="" disabled>
              Selecione uma opção
            </option>
            <option>Sim</option>
            <option>Não</option>
          </Select>
          <div className="full-width">
            <Input
              id="objective"
              name="objective"
              label="Objetivo do projeto"
              placeholder="Ex.: apresentar minha empresa e receber novos contatos"
              minLength={10}
              maxLength={500}
              required
              error={errors.objective}
            />
          </div>
          <Select
            id="deadline"
            name="deadline"
            label="Prazo desejado"
            defaultValue=""
            required
            error={errors.deadline}
          >
            <option value="" disabled>
              Quando você quer começar?
            </option>
            {deadlines.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
          <Select
            id="budget"
            name="budget"
            label="Faixa de investimento"
            defaultValue=""
            required
            error={errors.budget}
          >
            <option value="" disabled>
              Selecione uma faixa
            </option>
            {budgets.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
          <div className="full-width">
            <Textarea
              id="description"
              name="description"
              label="Descrição detalhada do projeto"
              placeholder="Conte sua ideia, funcionalidades, referências e o que mais for importante para você."
              rows={4}
              minLength={20}
              maxLength={5000}
              required
              error={errors.description}
            />
          </div>
        </div>
        <input name="plan" type="hidden" defaultValue="" />
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">Deixe este campo vazio</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="consent-field">
          <label>
            <input
              type="checkbox"
              name="consent"
              required
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span>
              Autorizo a D&G Studio a usar os dados informados para responder à
              minha solicitação. <a href="/privacidade">Privacidade</a>.
            </span>
          </label>
          {errors.consent && (
            <small className="field-error" id="consent-error">
              {errors.consent}
            </small>
          )}
        </div>
        <Button type="submit" className="submit-button">
          {sending ? (
            <>
              <LoaderCircle className="spin" size={17} aria-hidden="true" />
              Enviando solicitação…
            </>
          ) : (
            <>
              Enviar solicitação <ArrowUpRight size={18} aria-hidden="true" />
            </>
          )}
        </Button>
      </fieldset>
      <p className="form-security">
        <LockKeyhole size={12} aria-hidden="true" /> Sua ideia merece cuidado.
        Seus dados também.
      </p>
      {failure && (
        <div className="form-feedback feedback-error" role="alert">
          {failure}
        </div>
      )}
      {result && (
        <div
          ref={resultRef}
          tabIndex={-1}
          className="form-feedback"
          role="status"
        >
          <CheckCircle2 size={20} aria-hidden="true" />
          <div>
            <strong>
              {result.status === "sent"
                ? "Vamos construir algo juntos."
                : "Sua ideia, pronta para o próximo passo."}
            </strong>
            <p>{result.message}</p>
            {result.status === "draft" && draft && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => downloadQuote(draft)}
              >
                <Download size={15} aria-hidden="true" />
                Baixar resumo do projeto
              </Button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
