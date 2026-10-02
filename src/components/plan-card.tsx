import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Badge, ButtonLink } from "./ui";
import type { Plan } from "@/types";

export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article
      className={`plan-card ${plan.featured ? "plan-featured" : ""}`}
      data-reveal
    >
      <div className="plan-top">
        <span>PROJETO</span>
        <Badge>
          {plan.featured && <Sparkles size={12} aria-hidden="true" />}
          {plan.badge}
        </Badge>
      </div>
      <h3>{plan.name}</h3>
      <p>{plan.description}</p>
      <div className="plan-divider" />
      <span className="plan-includes">PENSADO PARA</span>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check size={15} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      <ButtonLink
        href={`?tipo=${encodeURIComponent(plan.projectType)}&plano=${encodeURIComponent(plan.name)}#orcamento`}
        variant={plan.featured ? "teal" : "secondary"}
      >
        Solicitar orçamento <ArrowUpRight size={16} aria-hidden="true" />
      </ButtonLink>
      <small>Orçamento personalizado para sua ideia.</small>
    </article>
  );
}
