import { useShop } from '../store/shop.jsx'

export default function Header({
  view,
  onView,
  search,
  onSearch,
  category,
  onCategory,
  categories,
}) {
  const { cartCount, state } = useShop()
  const totalCount = state.products.length

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-3">
          <button
            type="button"
            onClick={() => onView('shop')}
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-lg text-sky-400">
              N
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[15px] font-bold tracking-tight text-slate-900">
                Northwind Supply
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                Everyday goods, honestly made
              </span>
            </span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Sections">
              <button
                type="button"
                role="tab"
                aria-selected={view === 'shop'}
                onClick={() => onView('shop')}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  view === 'shop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Store
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === 'admin'}
                onClick={() => onView('admin')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  view === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Inventory
                <span className="rounded-full bg-slate-900/10 px-1.5 text-[11px] tabular-nums">
                  {totalCount}
                </span>
              </button>
            </div>

            {view === 'shop' && (
              <button
                type="button"
                onClick={() => onView('cart')}
                className="relative inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                aria-label={`Open cart, ${cartCount} items`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="20" r="1.4" />
                  <circle cx="18" cy="20" r="1.4" />
                </svg>
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-sky-500 px-1 text-[11px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {view === 'shop' && (
          <div className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-72 sm:flex-none">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search products…"
                className="field !pl-9"
                aria-label="Search products"
              />
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              <button
                type="button"
                onClick={() => onCategory('All')}
                className={`chip whitespace-nowrap ${category === 'All' ? 'chip-on' : 'chip-off'}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCategory(c)}
                  className={`chip whitespace-nowrap ${category === c ? 'chip-on' : 'chip-off'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
