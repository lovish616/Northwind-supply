import { useMemo, useState } from 'react'
import Modal from '../Modal.jsx'
import StatsBar from './StatsBar.jsx'
import ProductTable from './ProductTable.jsx'
import ProductForm from './ProductForm.jsx'
import { CATEGORIES } from '../../data/seed.js'
import { ago, money } from '../../lib/format.js'
import { useShop } from '../../store/shop.jsx'

const SORTERS = {
  name: (a, b) => a.name.localeCompare(b.name),
  category: (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  price: (a, b) => a.price - b.price,
  cost: (a, b) => a.cost - b.cost,
  stock: (a, b) => a.stock - b.stock,
  value: (a, b) => a.cost * a.stock - b.cost * b.stock,
}

export default function AdminPanel() {
  const { state, saveProduct, setLowStock, resetStore, adjustStock, toast } = useShop()
  const [tab, setTab] = useState('products')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState({ key: 'stock', dir: 'asc' })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return state.products
      .filter((p) => category === 'All' || p.category === category)
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const cmp = (SORTERS[sort.key] || SORTERS.name)(a, b)
        return sort.dir === 'asc' ? cmp : -cmp
      })
  }, [state.products, search, category, sort])

  const handleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setFormOpen(true)
  }

  const handleSave = (product) => {
    saveProduct(product)
    setFormOpen(false)
    setEditing(null)
  }

  const restock = (order) => {
    let restored = 0
    for (const item of order.items) {
      if (state.products.some((p) => p.id === item.id)) {
        adjustStock(item.id, item.qty)
        restored += item.qty
      }
    }
    toast(restored > 0 ? `Restocked ${restored} units from ${order.orderId}` : 'Products from this order no longer exist', restored > 0 ? 'success' : 'error')
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">Inventory management</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Stock control panel</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Everything here is live: edits reflect on the storefront instantly, and storefront sales decrement
            stock from this panel. Changes persist in this browser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setConfirmReset(true)} className="btn-outline h-10 px-4">
            Reset catalog
          </button>
          <button type="button" onClick={openNew} className="btn-accent h-10 px-4">
            + Add product
          </button>
        </div>
      </div>

      <StatsBar products={state.products} lowStock={state.lowStock} onThresholdChange={setLowStock} />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Panel sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'products'}
            onClick={() => setTab('products')}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Products
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'orders'}
            onClick={() => setTab('orders')}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Orders
            {state.orders.length > 0 && (
              <span className="ml-1.5 rounded-full bg-slate-900/10 px-1.5 text-[11px] tabular-nums">
                {state.orders.length}
              </span>
            )}
          </button>
        </div>

        {tab === 'products' && (
          <>
            <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, SKU, category…"
                className="field !pl-9"
                aria-label="Search inventory"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field !w-auto"
              aria-label="Filter by category"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="ml-auto text-xs text-slate-500">
              Showing {visible.length} of {state.products.length} SKUs
            </span>
          </>
        )}
      </div>

      <div className="mt-4">
        {tab === 'products' ? (
          <ProductTable
            products={visible}
            lowStock={state.lowStock}
            sort={sort}
            onSort={handleSort}
            onEdit={openEdit}
          />
        ) : (
          <OrdersTab orders={state.orders} onRestock={restock} />
        )}
      </div>

      <ProductForm
        open={formOpen}
        product={editing}
        allProducts={state.products}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        size="sm"
        labelledBy="reset-title"
      >
        <div className="p-6">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-amber-100 text-xl">↺</div>
          <h2 id="reset-title" className="mt-3 text-lg font-bold text-slate-900">
            Reset the whole catalog?
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            This replaces all {state.products.length} products with the original seed catalog and clears the
            cart and {state.orders.length} recorded order{state.orders.length === 1 ? '' : 's'}. Any stock,
            price or product you added is lost.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmReset(false)} className="btn-outline h-10 px-4">
              Keep my data
            </button>
            <button
              type="button"
              onClick={() => {
                resetStore()
                setConfirmReset(false)
              }}
              className="btn-danger h-10 px-4"
            >
              Reset catalog
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function OrdersTab({ orders, onRestock }) {
  if (orders.length === 0) {
    return (
      <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="text-4xl">🧾</span>
        <h3 className="text-base font-semibold text-slate-900">No orders yet</h3>
        <p className="max-w-sm text-sm text-slate-500">
          Complete a checkout on the storefront and the order will appear here with an option to restock its
          units.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article key={order.id} className="panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">{order.id}</p>
              <p className="text-xs text-slate-500">
                {ago(order.at)} · {order.items.reduce((n, i) => n + i.qty, 0)} units
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold tabular-nums text-slate-900">{money(order.total)}</span>
              <button type="button" onClick={() => onRestock(order)} className="btn-outline h-8 px-3 text-xs">
                Restock
              </button>
            </div>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
              >
                {item.qty}× {item.name}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
