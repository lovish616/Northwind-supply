import { useEffect, useState } from 'react'
import ProductArt from '../ProductArt.jsx'
import Modal from '../Modal.jsx'
import { money } from '../../lib/format.js'
import { useShop } from '../../store/shop.jsx'

const COLUMNS = [
  { key: 'name', label: 'Product', align: 'left' },
  { key: 'category', label: 'Category', align: 'left' },
  { key: 'price', label: 'Price', align: 'right' },
  { key: 'cost', label: 'Cost', align: 'right' },
  { key: 'stock', label: 'Stock', align: 'center' },
  { key: 'value', label: 'Stock value', align: 'right' },
]

function PriceCell({ product }) {
  const { setPrice } = useShop()
  const [draft, setDraft] = useState(String(product.price))
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setDraft(String(product.price))
  }, [product.price])

  const commit = () => {
    const value = Number(draft)
    setEditing(false)
    if (Number.isFinite(value) && value >= 0 && value !== product.price) setPrice(product.id, value)
    else setDraft(String(product.price))
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded px-1.5 py-1 text-sm font-semibold tabular-nums text-slate-700 hover:bg-slate-100"
        title="Click to edit price"
      >
        {money(product.price)}
      </button>
    )
  }

  return (
    <input
      type="number"
      min="0"
      step="0.01"
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') {
          setDraft(String(product.price))
          setEditing(false)
        }
      }}
      className="w-24 rounded-md border border-sky-400 bg-white px-2 py-1 text-right text-sm font-semibold tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
      aria-label={`Price for ${product.name}`}
    />
  )
}

function StockCell({ product, threshold }) {
  const { adjustStock, setStock } = useShop()
  const [draft, setDraft] = useState(String(product.stock))
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setDraft(String(product.stock))
  }, [product.stock])

  const tone =
    product.stock <= 0
      ? 'bg-rose-50 text-rose-700 ring-rose-200'
      : product.stock <= threshold
        ? 'bg-amber-50 text-amber-700 ring-amber-200'
        : 'bg-emerald-50 text-emerald-700 ring-emerald-200'

  const commit = () => {
    const value = Number(draft)
    setEditing(false)
    if (Number.isFinite(value) && value >= 0 && Math.round(value) !== product.stock) {
      setStock(product.id, Math.round(value))
    } else {
      setDraft(String(product.stock))
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        className="btn btn-outline h-7 w-7 !rounded-md !px-0 text-sm"
        onClick={() => adjustStock(product.id, -1)}
        disabled={product.stock <= 0}
        aria-label={`Decrease stock for ${product.name}`}
      >
        −
      </button>
      {editing ? (
        <input
          type="number"
          min="0"
          step="1"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(String(product.stock))
              setEditing(false)
            }
          }}
          className="w-16 rounded-md border border-sky-400 bg-white px-1.5 py-1 text-center text-sm font-bold tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          aria-label={`Stock for ${product.name}`}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`min-w-[3.5rem] rounded-md px-2 py-1 text-sm font-bold tabular-nums ring-1 hover:brightness-95 ${tone}`}
          title="Click to type an exact quantity"
        >
          {product.stock}
        </button>
      )}
      <button
        type="button"
        className="btn btn-outline h-7 w-7 !rounded-md !px-0 text-sm"
        onClick={() => adjustStock(product.id, 1)}
        aria-label={`Increase stock for ${product.name}`}
      >
        +
      </button>
    </div>
  )
}

export default function ProductTable({ products, lowStock, sort, onSort, onEdit }) {
  const { deleteProduct } = useShop()
  const [pendingDelete, setPendingDelete] = useState(null)

  if (products.length === 0) {
    return (
      <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="text-4xl">🗂️</span>
        <h3 className="text-base font-semibold text-slate-900">No products found</h3>
        <p className="max-w-sm text-sm text-slate-500">
          Nothing matches the current search or category filter. Adjust the filters or add a new product.
        </p>
      </div>
    )
  }

  const arrow = (key) => (sort.key === key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : '')

  return (
    <>
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className="inline-flex items-center gap-1 rounded hover:text-slate-900"
                  >
                    {col.label}
                    <span className="text-slate-400">{arrow(col.key)}</span>
                  </button>
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const flagged = p.stock <= 0 || p.stock <= lowStock
              return (
                <tr
                  key={p.id}
                  className={`group transition-colors hover:bg-slate-50/70 ${
                    p.stock <= 0 ? 'bg-rose-50/40' : flagged ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductArt product={p} className="h-11 w-11 shrink-0 rounded-lg text-xl [&>span]:text-xl" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{p.name}</p>
                        <p className="truncate text-xs text-slate-400">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3 text-right">
                    <PriceCell product={p} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-500">{money(p.cost)}</td>
                  <td className="px-4 py-3">
                    <StockCell product={p} threshold={lowStock} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-700">
                    {money(p.cost * p.stock)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="btn btn-outline h-8 px-3 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(p)}
                        className="btn h-8 border border-rose-200 bg-white px-3 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} size="sm" labelledBy="delete-title">
        <div className="p-6">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-rose-100 text-xl">🗑</div>
          <h2 id="delete-title" className="mt-3 text-lg font-bold text-slate-900">
            Delete this product?
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-semibold">{pendingDelete?.name}</span> ({pendingDelete?.sku}) will be removed
            from the catalog along with {pendingDelete?.stock} unit{pendingDelete?.stock === 1 ? '' : 's'} of
            stock. This cannot be undone.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setPendingDelete(null)} className="btn-outline h-10 px-4">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deleteProduct(pendingDelete.id)
                setPendingDelete(null)
              }}
              className="btn-danger h-10 px-4"
            >
              Delete product
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
