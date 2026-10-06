import {
  dateLabel,
  EmptyState,
  moneyLabel,
  StatusBadge,
} from "../project-components";
import type { SectionProps } from "./types";
export function FinancePanel({ data }: SectionProps) {
  // Totals are provided separately so pagination never changes the financial summary.
  const total = Number(data.items[0]?.total_cents || 0);
  const paid = Number(data.items[0]?.paid_cents || 0);
  return (
    <div className="portal-stack">
      <section className="portal-card">
        <h2>Resumo financeiro</h2>
        <div className="portal-stats portal-finance-stats">
          <div>
            <small>Valor do projeto</small>
            <strong>{moneyLabel(total)}</strong>
          </div>
          <div>
            <small>Pago</small>
            <strong>{moneyLabel(paid)}</strong>
          </div>
          <div>
            <small>Restante</small>
            <strong>{moneyLabel(total - paid)}</strong>
          </div>
        </div>
      </section>
      <section className="portal-card">
        {data.items.length ? (
          <div className="portal-table-scroll">
            <table className="portal-table">
              <caption>Parcelas do projeto</caption>
              <thead>
                <tr>
                  <th>Parcela</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{moneyLabel(Number(item.amount_cents))}</td>
                    <td>{dateLabel(String(item.due_on))}</td>
                    <td>
                      <StatusBadge status={String(item.status)} />
                      {item.paid_on && (
                        <small>Pago em {dateLabel(String(item.paid_on))}</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Nenhuma parcela cadastrada"
            description="As condições financeiras do projeto serão disponibilizadas aqui."
          />
        )}
      </section>
    </div>
  );
}
