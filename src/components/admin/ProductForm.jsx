import { useEffect, useState } from 'react'
import Modal from '../Modal.jsx'
import { CATEGORIES } from '../../data/seed.js'
import { newProductId } from '../../store/shop.jsx'

const GLYPH_SUGGESTIONS = ['👕', '👜', '🧦', '☕', '🪵', '🫖', '🍳', '🛏️', '💡', '🧶', '🎒', '🥤', '🧥', '🖊️', '📓', '🖥️', '🪴', '🗂️', '📦']

function blank(category) {
  return {
    id: newProductId(),
    sku: '',
    name: '',
    category: category && category !== 'All' ? category : CATEGORIES[0],
    price: '',
    cost: '',
    stock: '',
    glyph: '',
    tint: 'from-slate-400 to-slate-300',
    rating: 4.5,
    blurb: '',
  }
}

export default function ProductForm({ open, product, allProducts, onClose, onSave }) {
  const [form, setForm] = useState(() => blank())
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setErrors({})
    if (product) {
      setForm({
        ...product,
        price: String(product.price),
        cost: String(product.cost),
        stock: String(product.stock),
      })
    } else {
      setForm(blank())
    }
  }, [open, product])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    const name = form.name.trim()
    const sku = form.sku.trim().toUpperCase()
    const price = Number(form.price)
    const cost = Number(form.cost)
    const stock = Number(form.stock)

    if (!name) next.name = 'Product name is required'
    if (!sku) next.sku = 'SKU is required'
    else if (allProducts.some((p) => p.sku.toUpperCase() === sku && p.id !== form.id))
      next.sku = 'SKU already in use'
    if (form.price === '' || !Number.isFinite(price) || price < 0) next.price = 'Enter a valid price'
    if (form.cost === '' || !Number.isFinite(cost) || cost < 0) next.cost = 'Enter a valid cost'
    if (cost > price && price > 0) next.cost = 'Cost is higher than the selling price'
    if (form.stock === '' || !Number.isFinite(stock) || stock < 0) next.stock = 'Enter a valid stock level'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSave({
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      price: Number(form.price),
      cost: Number(form.cost),
      stock: Number(form.stock),
      glyph: form.glyph.trim(),
      blurb: form.blurb.trim(),
      tint: form.tint || 'from-slate-400 to-slate-300',
      rating: Number(form.rating) || 4.5,
    })
  }

  const error = (key) =>
    errors[key] ? <p className="mt-1 text-xs font-medium text-rose-600">{errors[key]}</p> : null

  return (
    <Modal open={open} onClose={onClose} size="md" labelledBy="product-form-title">
      <form onSubmit={submit} noValidate>
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="product-form-title" className="text-base font-bold text-slate-900">
              {product ? 'Edit product' : 'Add product'}
            </h2>
            <p className="text-xs text-slate-500">
              {product ? `Updating ${product.sku}` : 'A new SKU will appear in the storefront immediately'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            ✕
          </button>
        </header>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="pf-name">Product name</label>
            <input id="pf-name" className="field" value={form.name} onChange={set('name')} placeholder="Coastal Linen Shirt" />
            {error('name')}
          </div>

          <div>
            <label className="label" htmlFor="pf-sku">SKU</label>
            <input
              id="pf-sku"
              className="field uppercase"
              value={form.sku}
              onChange={set('sku')}
              placeholder="NW-APP-119"
            />
            {error('sku')}
          </div>

          <div>
            <label className="label" htmlFor="pf-category">Category</label>
            <select id="pf-category" className="field" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="pf-price">Selling price ($)</label>
            <input id="pf-price" type="number" min="0" step="0.01" className="field tabular-nums" value={form.price} onChange={set('price')} placeholder="49.00" />
            {error('price')}
          </div>

          <div>
            <label className="label" htmlFor="pf-cost">Unit cost ($)</label>
            <input id="pf-cost" type="number" min="0" step="0.01" className="field tabular-nums" value={form.cost} onChange={set('cost')} placeholder="22.00" />
            {error('cost')}
          </div>

          <div>
            <label className="label" htmlFor="pf-stock">Stock on hand</label>
            <input id="pf-stock" type="number" min="0" step="1" className="field tabular-nums" value={form.stock} onChange={set('stock')} placeholder="25" />
            {error('stock')}
          </div>

          <div>
            <label className="label" htmlFor="pf-rating">Rating (0–5)</label>
            <input id="pf-rating" type="number" min="0" max="5" step="0.1" className="field tabular-nums" value={form.rating} onChange={set('rating')} />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="pf-glyph">Image glyph (emoji)</label>
            <input id="pf-glyph" className="field" value={form.glyph} onChange={set('glyph')} placeholder="👕" maxLength={4} />
            <div className="mt-2 flex flex-wrap gap-1">
              {GLYPH_SUGGESTIONS.slice(0, 12).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, glyph: g }))}
                  className={`h-8 w-8 rounded-md border text-base transition-colors ${
                    form.glyph === g ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-400'
                  }`}
                  aria-label={`Use ${g} glyph`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="pf-blurb">Description</label>
            <textarea
              id="pf-blurb"
              rows={3}
              className="field resize-y"
              value={form.blurb}
              onChange={set('blurb')}
              placeholder="Short copy shown on the product card and detail view."
            />
          </div>

          <div className="sm:col-span-2">
            <span className="label">Tile colour</span>
            <div className="flex flex-wrap gap-2">
              {[
                'from-sky-400 to-cyan-300',
                'from-amber-400 to-orange-300',
                'from-teal-400 to-emerald-300',
                'from-rose-400 to-orange-300',
                'from-indigo-400 to-sky-300',
                'from-violet-400 to-indigo-300',
                'from-slate-400 to-zinc-300',
                'from-lime-400 to-emerald-300',
              ].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tint: t }))}
                  className={`h-8 w-8 rounded-full bg-gradient-to-br ${t} ${
                    form.tint === t ? 'ring-2 ring-slate-900 ring-offset-2' : ''
                  }`}
                  aria-label={`Choose colour ${t}`}
                />
              ))}
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-outline h-10 px-4">
            Cancel
          </button>
          <button type="submit" className="btn-primary h-10 px-5">
            {product ? 'Save changes' : 'Add product'}
          </button>
        </footer>
      </form>
    </Modal>
  )
}
