export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`logo ${compact ? "logo-compact" : ""}`}
      aria-label="D&G Studio"
    >
      <span className="logo-mark">
        D<span>&</span>G
        <span className="logo-dot" aria-hidden="true">
          .
        </span>
      </span>
      <span className="logo-studio">STUDIO</span>
    </span>
  );
}
