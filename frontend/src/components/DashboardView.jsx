import { formatDKK } from './format.js';

function Bars({ rows, labelKey }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  return (
    <ul className="bars">
      {rows.map((r) => (
        <li key={r[labelKey]}>
          <span className="bar-label">{r[labelKey]}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${(r.total / max) * 100}%` }} />
          </span>
          <span className="bar-value">{formatDKK(r.total)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardView({ data }) {
  return (
    <div className="dashboard">
      <div className="card total-card">
        <span className="muted">Grand total</span>
        <strong className="total">{formatDKK(data.grandTotal)}</strong>
      </div>
      <div className="grid-2">
        <section className="card">
          <h3>Total by category</h3>
          <Bars rows={data.totalByCategory} labelKey="category" />
        </section>
        <section className="card">
          <h3>Daily budget</h3>
          <strong className="total">{formatDKK(data.dailyBudget.perDay)}</strong>
          <span className="muted"> per day</span>
          <p className="muted">
            {formatDKK(data.dailyBudget.total)} over {data.dailyBudget.days} days. Counts only{' '}
            {data.dailyBudget.categories.join(', ')}. Flights, Accommodation and Travel insurance are not included.
          </p>
        </section>
      </div>
    </div>
  );
}
