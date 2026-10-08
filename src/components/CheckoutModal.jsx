import Modal from './Modal.jsx'
import { ago, money } from '../lib/format.js'
import { useShop } from '../store/shop.jsx'

export default function CheckoutModal({ order, onClose, onGoInventory }) {
  const { state } = useShop()
  if (!order) return null

  const lowCount = state.products.filter((p) => p.stock > 0 && p.stock <= state.lowStock).length
  const outCount = state.products.filter((p) => p.stock <= 0).length

  return (
    <Modal open={Boolean(order)} onClose={onClose} size="md" labelledBy="checkout-title">
      <div className="p-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl">
          ✅
        </div>
        <h2 id="checkout-title" className="mt-4 text-xl font-bold tracking-tight text-slate-900">
          Order confirmed
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {order.orderId} · placed {ago(order.at)}. Inventory has been updated automatically.
        </p>
      </div>

      <div className="border-y border-slate-100 bg-slate-50 px-6 py-4">
        <ul className="divide-y divide-slate-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0 truncate text-slate-700">
                <span className="font-semibold text-slate-900 tabular-nums">{item.qty}×</span> {item.name}
              </span>
              <span className="shrink-0 tabular-nums text-slate-600">{money(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-slate-300 pt-2 text-sm font-bold text-slate-900">
          <span>Total charged</span>
          <span className="tabular-nums">{money(order.total)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-6 py-4 text-xs text-slate-500">
        <span>
          ⚠ {lowCount} low-stock · {outCount} out of stock
        </span>
        <span>Sent to your (demo) inbox</span>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="btn-outline h-10 px-4">
          Continue shopping
        </button>
        <button
          type="button"
          onClick={() => {
            onClose()
            onGoInventory()
          }}
          className="btn-primary h-10 px-4"
        >
          Review inventory
        </button>
      </div>
    </Modal>
  )
}
