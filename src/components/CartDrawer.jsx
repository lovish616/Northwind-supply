import { useEffect, useRef } from 'react'
import ProductArt from './ProductArt.jsx'
import { money } from '../lib/format.js'
import { useShop } from '../store/shop.jsx'
import { useEntrance } from '../lib/useEntrance.js'

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { cartLines, cartTotal, setCartQty, removeFromCart, clearCart, state } = useShop()
  const rootRef = useRef(null)
  useEntrance(rootRef, open)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const shipping = cartTotal >= 75 || cartTotal === 0 ? 0 : 6.5
  const count = cartLines.reduce((n, l) => n + l.qty, 0)

  return (
    <div ref={rootRef} className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-drawer animate-slide-in"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your cart</h2>
            <p className="text-xs text-slate-500">
              {count === 0 ? 'Nothing here yet' : `${count} item${count === 1 ? '' : 's'} reserved`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            ✕
          </button>
        </header>

        {cartLines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="text-4xl">🛒</span>
            <h3 className="text-sm font-semibold text-slate-900">Your cart is empty</h3>
            <p className="text-xs text-slate-500">Browse the catalog and add something you love.</p>
            <button type="button" onClick={onClose} className="btn-primary h-9 px-4 text-xs">
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
              {cartLines.map((line) => {
                const product = line.product
                return (
                  <div key={line.id} className="flex gap-3 py-4">
                    <ProductArt product={product} className="h-16 w-16 shrink-0 rounded-lg text-2xl [&>span]:text-2xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">
                            {money(product.price)} each · {product.stock} in stock
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(line.id)}
                          className="shrink-0 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          🗑
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-lg border border-slate-300 p-0.5">
                          <button
                            type="button"
                            className="btn btn-ghost h-7 w-7 !rounded-md"
                            onClick={() => setCartQty(line.id, line.qty - 1)}
                            aria-label={`Decrease ${product.name}`}
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums text-slate-900">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            className="btn btn-ghost h-7 w-7 !rounded-md"
                            onClick={() => setCartQty(line.id, line.qty + 1)}
                            disabled={line.qty >= product.stock}
                            aria-label={`Increase ${product.name}`}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-bold tabular-nums text-slate-900">
                          {money(line.lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <footer className="border-t border-slate-200 px-5 py-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{money(cartTotal)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>Shipping</dt>
                  <dd className="tabular-nums">{shipping === 0 ? 'Free' : money(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-base font-bold text-slate-900">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{money(cartTotal + shipping)}</dd>
                </div>
              </dl>

              {shipping > 0 && (
                <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-[11px] font-medium text-sky-700">
                  Add {money(75 - cartTotal)} more for free shipping.
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <button type="button" onClick={clearCart} className="btn-outline h-11 flex-1">
                  Clear
                </button>
                <button type="button" onClick={onCheckout} className="btn-accent h-11 flex-[2]">
                  Checkout · {money(cartTotal + shipping)}
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                Demo checkout — no payment is collected. Stock decrements on purchase.
                {state.orders.length > 0 && ` ${state.orders.length} order${state.orders.length === 1 ? '' : 's'} recorded.`}
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
