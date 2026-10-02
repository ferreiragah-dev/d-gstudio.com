"use client";
import { useEffect } from "react";

// ⚙️ Velocidade da animação — ajuste aqui (valores em milissegundos).
const INTERVALO = 700; // tempo entre a entrada de um card e a do próximo
const ATRASO_INICIAL = 300; // espera depois que a seção aparece na tela
const DURACAO_ENTRADA = 600; // duração da entrada de cada card
const DURACAO_BRILHO = 900; // quanto tempo o card "atual" fica com o brilho roxo

/**
 * Faz os cards de Serviços entrarem um de cada vez, com brilho no card atual.
 * Usa só a API do navegador (IntersectionObserver + classes CSS), sem bibliotecas.
 * Os cards só ficam escondidos quando <html> tem a classe "js" (ver layout.tsx).
 */
export function ServicesAnimation({ gridId }: { gridId: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const grid = document.getElementById(gridId);
    // Avisa o script de segurança do layout que o JS carregou.
    root.setAttribute("data-services-anim", "");
    if (!grid) return;

    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>(".service-card"),
    );
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };
    // A duração usada no CSS vem daqui, para manter um único lugar de ajuste.
    grid.style.setProperty("--servicos-entrada", `${DURACAO_ENTRADA}ms`);

    const show = (card: HTMLElement, glow = true) => {
      if (card.classList.contains("is-visible")) return;
      card.classList.add("is-visible", "is-entering");
      // Ao fim da entrada, volta à transição normal do card (hover mais rápido).
      later(() => card.classList.remove("is-entering"), DURACAO_ENTRADA);
      if (!glow) return;
      card.classList.add("is-current");
      later(() => card.classList.remove("is-current"), DURACAO_BRILHO);
    };

    // Movimento reduzido: tudo aparece já visível, sem animação.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }

    // Quem navega pelo teclado nunca cai num card invisível.
    const onFocus = (event: FocusEvent) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>(
        ".service-card",
      );
      if (card) show(card, false);
    };
    grid.addEventListener("focusin", onFocus);

    // Uma coluna (celular): cada card anima quando ele mesmo chega na tela,
    // assim quem rola rápido não perde nenhum.
    const singleColumn =
      getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length ===
      1;

    let observer: IntersectionObserver;
    if (singleColumn) {
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            show(entry.target as HTMLElement);
          }),
        { threshold: 0.2 },
      );
      cards.forEach((card) => observer.observe(card));
    } else {
      // Grade com várias colunas: dispara uma única vez e anima em sequência (1 a 8).
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          cards.forEach((card, index) =>
            later(() => show(card), ATRASO_INICIAL + index * INTERVALO),
          );
        },
        { threshold: 0.2 },
      );
      observer.observe(grid);
    }

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
      grid.removeEventListener("focusin", onFocus);
      // Volta ao estado inicial (no modo dev o React monta o efeito duas vezes).
      cards.forEach((card) =>
        card.classList.remove("is-visible", "is-entering", "is-current"),
      );
    };
  }, [gridId]);

  return null;
}
