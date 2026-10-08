import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import ProductArt from './ProductArt.jsx'
import { money, stars, stockLabel } from '../lib/format.js'
import { useShop } from '../store/shop.jsx'

export default function ProductModal({ product, lowStock, onClose }) {
  const { addToCart, state } = useShop()
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setQty(1)
  }, [product?.id])

  if (!product) return null

  const label = stockLabel(product.stock, lowStock)
  const inCart = state.cart.find((c) => c.id === product.id)?.qty ?? 0
  const remaining = Math.max(0, product.stock - inCart)
  const max = Math.max(1, product.stock)
  const soldOut = product.stock <= 0

  const handleAdd = () => {
    addToCart(product.id, qty)
    onClose()
  }

  return (
    <Modal open={Boolean(product)} onClose={onClose} size="lg" labelledBy="product-modal-title">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close product details"
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-slate-600 shadow-sm hover:bg-white hover:text-slate-900"
      >
        ✕
      </button>

      <div className="grid gap-0 sm:grid-cols-2">
        <ProductArt product={product} className="h-52 sm:h-full sm:min-h-[320px]" />

        <div className="flex flex-col gap-4 p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {product.category} · SKU {product.sku}
            </p>
            <h2 id="product-modal-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              {product.name}
            </h2>
            <p className="mt-1 text-xs text-amber-500">
              {stars(product.rating)}{' '}
              <span className="ml-1 text-slate-500">{product.rating.toFixed(1)} · {label.text}</span>
            </p>
          </div>

          <p className="text-sm leading-relaxed text-slate-600">{product.blurb}</p>

          <dl className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
            <div>
              <dt className="font-semibold uppercase tracking-wide text-slate-400">On hand</dt>
              <dd className="mt-0.5 font-bold text-slate-900 tabular-nums">{product.stock} units</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-slate-400">In your cart</dt>
              <dd className="mt-0.5 font-bold text-slate-900 tabular-nums">{inCart} units</dd>
            </div>
          </dl>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Price</p>
              <p className="text-3xl font-bold tabular-nums text-slate-900">{money(product.price)}</p>
            </div>

            {!soldOut && (
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Quantity</p>
                <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
                  <button
                    type="button"
                    className="btn btn-ghost h-8 w-8 !rounded-md"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold tabular-nums text-slate-900">{qty}</span>
                  <button
                    type="button"
                    className="btn btn-ghost h-8 w-8 !rounded-md"
                    onClick={() => setQty((q) => Math.min(max, q + 1))}
                    disabled={qty >= max}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              className="btn-primary h-11 w-full"
              onClick={handleAdd}
              disabled={soldOut || remaining <= 0}
            >
              {soldOut
                ? 'Sold out'
                : remaining <= 0
                  ? 'All units already in cart'
                  : `Add ${qty} to cart · ${money(product.price * qty)}`}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              Free shipping on orders over $75 · 30-day returns
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
