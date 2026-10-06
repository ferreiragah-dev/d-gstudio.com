export default function PortalLoading() {
  return (
    <div
      className="portal-loading"
      role="status"
      aria-label="Carregando área do cliente"
    >
      <div className="portal-skeleton" />
      <div className="portal-skeleton" />
      <div className="portal-skeleton" />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
