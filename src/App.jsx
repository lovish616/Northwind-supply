import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import ProductGrid from './components/ProductGrid.jsx'
import ProductModal from './components/ProductModal.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import CheckoutModal from './components/CheckoutModal.jsx'
import Toasts from './components/Toasts.jsx'
import AdminPanel from './components/admin/AdminPanel.jsx'
import { CATEGORIES } from './data/seed.js'
import { money } from './lib/format.js'
import { useShop } from './store/shop.jsx'

const STORE_SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'rating', label: 'Top rated' },
  { key: 'name', label: 'Name A–Z' },
]

function readHash() {
  return typeof window !== 'undefined' && window.location.hash.replace(/^#\/?/, '') === 'admin'
    ? 'admin'
    : 'shop'
}

export default function App() {
  const { state, checkout } = useShop()
  const [view, setView] = useState(readHash)
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('featured')
  const [active, setActive] = useState(null)
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const onHash = () => setView(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((next) => {
    setCartOpen(false)
    if (next === 'admin') {
      setView('admin')
      window.location.hash = '/admin'
    } else {
      setView('shop')
      if (window.location.hash) window.location.hash = ''
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleView = useCallback(
    (next) => {
      if (next === 'cart') setCartOpen(true)
      else navigate(next)
    },
    [navigate],
  )

  const products = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = state.products.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.blurb.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)),
    )
    const sorted = [...list]
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [state.products, search, category, sort])

  const inStock = products.filter((p) => p.stock > 0).length

  const handleCheckout = () => {
    const result = checkout()
    if (!result) return
    setCartOpen(false)
    setOrder(result)
  }

  return (
    <div className="min-h-screen">
      <Header
        view={view}
        onView={handleView}
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        categories={CATEGORIES}
      />

      {view === 'admin' ? (
        <main>
          <AdminPanel />
        </main>
      ) : (
        <main>
          <section className="border-b border-slate-200 bg-gradient-to-b from-sky-50 to-white">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:py-14">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold text-sky-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live inventory · {state.products.reduce((n, p) => n + p.stock, 0)} units in stock
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Everyday goods,
                  <span className="block text-slate-500">honestly made.</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  Small-batch homeware, apparel and outdoor kit from makers we know by name. Every order here
                  updates real stock levels — open the Inventory panel to watch it happen.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => navigate('admin')} className="btn-primary h-11 px-5">
                    Open inventory panel
                  </button>
                  <a href="#products" className="btn-outline h-11 px-5">
                    Browse the catalog
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: 'Free shipping', v: 'on orders over $75' },
                  { k: '30-day returns', v: 'no questions asked' },
                  { k: `${CATEGORIES.length} categories`, v: 'curated, not endless' },
                  { k: 'Small batch', v: 'restocked weekly' },
                ].map((item) => (
                  <div key={item.k} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
                    <p className="text-sm font-bold text-slate-900">{item.k}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="products" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  {category === 'All' ? 'All products' : category}
                </h2>
                <p className="text-sm text-slate-500">
                  {products.length} result{products.length === 1 ? '' : 's'}
                  {inStock < products.length && ` · ${products.length - inStock} sold out`}
                  {search && ` for “${search}”`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="store-sort" className="text-xs font-semibold text-slate-500">
                  Sort
                </label>
                <select
                  id="store-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="field !w-auto !py-1.5 text-xs"
                >
                  {STORE_SORTS.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <ProductGrid
              products={products}
              lowStock={state.lowStock}
              onOpen={setActive}
              onReset={() => {
                setSearch('')
                setCategory('All')
              }}
            />
          </section>
        </main>
      )}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-slate-500">
            Northwind Supply — a single-page storefront and inventory panel. Data lives in this browser only.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button type="button" onClick={() => navigate('shop')} className="hover:text-slate-900">
              Store
            </button>
            <button type="button" onClick={() => navigate('admin')} className="hover:text-slate-900">
              Inventory
            </button>
            <span>{state.products.length} SKUs · {money(state.products.reduce((n, p) => n + p.cost * p.stock, 0))} stock value</span>
          </div>
        </div>
      </footer>

      <ProductModal product={active} lowStock={state.lowStock} onClose={() => setActive(null)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
      <CheckoutModal
        order={order}
        onClose={() => setOrder(null)}
        onGoInventory={() => navigate('admin')}
      />
      <Toasts />
    </div>
  )
}
