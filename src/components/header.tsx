"use client";
import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { navigation } from "@/config/site";
import { Container } from "./ui";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth >= 1100) setOpen(false);
    };
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  return (
    <header className={`site-header ${scrolled || open ? "is-scrolled" : ""}`}>
      <Container className="header-inner">
        <a
          href="#inicio"
          className="logo-link"
          aria-label="D&G Studio — início"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </a>
        <nav
          id="main-navigation"
          aria-label="Navegação principal"
          className={`navigation ${open ? "is-open" : ""}`}
        >
          {navigation.map((item) => (
            <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <Link
            href="/cliente/login"
            className="portal-menu-link"
            onClick={() => setOpen(false)}
          >
            Acompanhar meu projeto
          </Link>
          <a
            href="#orcamento"
            className="mobile-quote"
            onClick={() => setOpen(false)}
          >
            Solicitar orçamento <ArrowUpRight size={16} />
          </a>
        </nav>
        <ThemeToggle />
        <a href="#orcamento" className="button header-cta">
          Solicitar orçamento <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </Container>
    </header>
  );
}
