import { money, stockLabel } from '../../lib/format.js'

function StatCard({ label, value, sub, tone = 'default', icon }) {
  const tones = {
    default: 'text-slate-900',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
    emerald: 'text-emerald-600',
  }
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <span className="text-base leading-none">{icon}</span>
      </div>
      <p className={`mt-2 text-2xl font-bold tabular-nums tracking-tight ${tones[tone]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export default function StatsBar({ products, lowStock, onThresholdChange }) {
  const skus = products.length
  const units = products.reduce((n, p) => n + p.stock, 0)
  const costValue = products.reduce((n, p) => n + p.cost * p.stock, 0)
  const retailValue = products.reduce((n, p) => n + p.price * p.stock, 0)
  const low = products.filter((p) => p.stock > 0 && p.stock <= lowStock).length
  const out = products.filter((p) => p.stock <= 0).length

  return (
    <section aria-label="Inventory statistics">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Active SKUs" value={skus} sub="products listed" icon="📦" />
        <StatCard label="Units on hand" value={units.toLocaleString()} sub="across all SKUs" icon="🧮" />
        <StatCard
          label="Stock value"
          value={money(costValue)}
          sub={`${money(retailValue)} at retail`}
          icon="💰"
        />
        <StatCard
          label="Low stock"
          value={low}
          sub={`at or below ${lowStock} units`}
          tone="amber"
          icon="⚠️"
        />
        <StatCard label="Out of stock" value={out} sub="unavailable to buy" tone="rose" icon="🚫" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <label htmlFor="threshold" className="text-xs font-semibold text-slate-600">
          Low-stock threshold
        </label>
        <input
          id="threshold"
          type="number"
          min="0"
          max="999"
          value={lowStock}
          onChange={(e) => onThresholdChange(e.target.value)}
          className="field !w-24 !py-1.5 text-center tabular-nums"
        />
        <span className="text-xs text-slate-500">
          SKUs at or below this quantity are flagged as low stock across the store.
        </span>
        <span className="ml-auto flex items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {products.filter((p) => stockLabel(p.stock, lowStock).tone === 'emerald').length} healthy
          </span>
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {low} low
          </span>
          <span className="flex items-center gap-1.5 text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            {out} out
          </span>
        </span>
      </div>
    </section>
  )
}
