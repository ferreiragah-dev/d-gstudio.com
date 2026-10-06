"use client";
import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { portalPost } from "./api";
import type { PortalRecord } from "@/types/portal";
export function Notifications({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PortalRecord[]>([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const changed = () => setReload((value) => value + 1);
    window.addEventListener("dg-portal-change", changed);
    return () => window.removeEventListener("dg-portal-change", changed);
  }, []);
  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();
    fetch(`/api/portal/alerts?project=${projectId}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
      })
      .then((result) => {
        setItems(result.items);
        setUnread(result.unread);
        setError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setError("Não foi possível carregar as notificações.");
      });
    return () => controller.abort();
  }, [projectId, reload]);
  async function read(id?: string) {
    setPending(true);
    try {
      await portalPost("notifications", { projectId, id });
    } catch {
      setError("Tente novamente.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="portal-notifications">
      <button
        type="button"
        className="theme-toggle"
        aria-label={`Notificações${unread ? `: ${unread} não lidas` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Bell size={18} />
        {unread > 0 && <span className="portal-unread">{unread}</span>}
      </button>
      {open && (
        <section className="portal-notification-list" aria-label="Notificações">
          <div className="portal-row">
            <h2>Notificações</h2>
            <button
              className="portal-icon-button"
              aria-label="Fechar notificações"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          {error ? (
            <>
              <p role="alert">{error}</p>
              <Button onClick={() => setReload((value) => value + 1)}>
                Tentar novamente
              </Button>
            </>
          ) : !items.length ? (
            <p>Nenhuma notificação por enquanto.</p>
          ) : (
            <>
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() => read()}
              >
                Marcar todas como lidas
              </Button>
              {items.map((item) => (
                <article
                  key={item.id}
                  className={`portal-notification ${item.read_at ? "" : "is-unread"}`}
                >
                  <Link
                    href={`/cliente/${item.section}?projeto=${projectId}`}
                    onClick={() => setOpen(false)}
                  >
                    {item.title}
                  </Link>
                  <small>
                    {new Date(item.created_at).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    })}
                  </small>
                  {!item.read_at && (
                    <button
                      disabled={pending}
                      className="text-link"
                      onClick={() => read(item.id)}
                    >
                      Marcar como lida
                    </button>
                  )}
                </article>
              ))}
            </>
          )}
        </section>
      )}
    </div>
  );
}
