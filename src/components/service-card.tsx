import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/types";

export function ServiceCard({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  const Icon = service.icon;
  return (
    <a
      href={`?tipo=${encodeURIComponent(service.title === "Sites" ? "Site" : service.title === "Landing Pages" ? "Landing Page" : service.title === "Portfólios" ? "Portfólio" : service.title === "Sistemas Web" ? "Sistema Web" : service.title === "Integrações" ? "Integração" : service.title === "SEO" ? "Outro" : service.title)}#orcamento`}
      className="service-card"
    >
      <div className="service-card-top">
        <span className="service-icon">
          <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="card-number">0{index + 1}</span>
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <span className="service-card-link">
        Vamos criar <ArrowUpRight size={15} aria-hidden="true" />
      </span>
    </a>
  );
}
