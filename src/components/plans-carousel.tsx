"use client";
import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlanCard } from "./plan-card";
import type { Plan } from "@/types";

// Distância mínima (px) do swipe horizontal para girar o carrossel.
const SWIPE_MINIMO = 40;

/** Offset do card em relação ao ativo, normalizado para -1, 0 ou 1 (circular). */
function getOffset(index: number, active: number, total: number) {
  let offset = (index - active + total) % total;
  if (offset > total / 2) offset -= total;
  return Math.max(-1, Math.min(1, offset));
}

export function PlansCarousel({ plans }: { plans: Plan[] }) {
  const total = plans.length;
  const featured = plans.findIndex((plan) => plan.featured);
  const [active, setActive] = useState(featured === -1 ? 0 : featured);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = (step: number) =>
    setActive((current) => (current + step + total) % total);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  };

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Só conta como swipe se o gesto for mais horizontal que vertical.
    if (Math.abs(dx) < SWIPE_MINIMO || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  };

  return (
    <div
      className="plans-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Planos de projeto"
      onKeyDown={onKeyDown}
      data-reveal
    >
      <div
        className="plans-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {plans.map((plan, index) => {
          const offset = getOffset(index, active, total);
          const isActive = offset === 0;
          return (
            <div
              key={plan.name}
              className={`plans-slot ${isActive ? "is-active" : ""}`}
              data-offset={offset}
              aria-hidden={isActive ? "false" : "true"}
              onClick={isActive ? undefined : () => setActive(index)}
            >
              {/* Card lateral: conteúdo inerte (botão sem foco nem clique);
                  o clique passa para o slot e traz o card para o centro. */}
              <div className="plans-slot-card" inert={!isActive}>
                <PlanCard plan={plan} reveal={false} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="plans-controls">
        <button
          type="button"
          className="plans-arrow"
          aria-label="Plano anterior"
          onClick={() => go(-1)}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <p className="plans-status" aria-live="polite">
          <span className="sr-only">Plano </span>
          {active + 1} / {total}
          <span className="sr-only">: {plans[active].name}</span>
        </p>
        <button
          type="button"
          className="plans-arrow"
          aria-label="Próximo plano"
          onClick={() => go(1)}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
