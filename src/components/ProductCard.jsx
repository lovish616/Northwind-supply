import ProductArt from './ProductArt.jsx'
import { money, stars, stockLabel } from '../lib/format.js'
import { useShop } from '../store/shop.jsx'

export default function ProductCard({ product, lowStock, onOpen }) {
  const { addToCart, state } = useShop()
  const inCart = state.cart.find((c) => c.id === product.id)?.qty ?? 0
  const label = stockLabel(product.stock, lowStock)
  const soldOut = product.stock <= 0
  const toneClass =
    label.tone === 'rose'
      ? 'bg-rose-50 text-rose-700 ring-rose-200'
      : label.tone === 'amber'
        ? 'bg-amber-50 text-amber-700 ring-amber-200'
        : 'bg-emerald-50 text-emerald-700 ring-emerald-200'

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition-shadow hover:shadow-lg">
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
        aria-label={`View ${product.name}`}
      >
        <ProductArt product={product} className="h-40 transition-transform duration-300 group-hover:scale-[1.03]" />
        <span
          className={`absolute left-2.5 top-2.5 rounded-md px-2 py-1 text-[11px] font-bold ring-1 ${toneClass}`}
        >
          {label.text}
        </span>
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-slate-900/55">
            <span className="rounded-md bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
              Sold out
            </span>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {product.category}
            </p>
            <h3 className="truncate text-sm font-semibold text-slate-900">{product.name}</h3>
          </div>
          <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
            {money(product.price)}
          </span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{product.blurb}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-xs text-amber-500" title={`${product.rating} out of 5`}>
            {stars(product.rating)} <span className="ml-0.5 text-slate-400">{product.rating.toFixed(1)}</span>
          </span>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => addToCart(product.id, 1)}
            className="btn-primary h-8 px-3 text-xs"
          >
            {soldOut ? 'Sold out' : inCart > 0 ? `In cart · ${inCart}` : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
