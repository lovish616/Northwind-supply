import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ products, lowStock, onOpen, onReset }) {
  if (products.length === 0) {
    return (
      <div className="panel flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="text-4xl">🔍</span>
        <h3 className="text-base font-semibold text-slate-900">No products match</h3>
        <p className="max-w-sm text-sm text-slate-500">
          Try a different search term, or clear the active category filter to see the full catalog.
        </p>
        <button type="button" onClick={onReset} className="btn-outline h-9 px-4 text-xs">
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} lowStock={lowStock} onOpen={onOpen} />
      ))}
    </div>
  )
}
