import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { LOW_STOCK_DEFAULT, SEED_PRODUCTS } from '../data/seed.js'

const STORAGE_KEY = 'northwind-store:v1'

const DEFAULT_GLYPHS = {
  Apparel: '👕',
  Kitchen: '🍳',
  Home: '🛋️',
  Outdoor: '🎒',
  Office: '🖇️',
}

function freshState() {
  return {
    products: SEED_PRODUCTS.map((p) => ({ ...p })),
    cart: [],
    orders: [],
    lowStock: LOW_STOCK_DEFAULT,
  }
}

function loadState() {
  if (typeof window === 'undefined') return freshState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.products) || parsed.products.length === 0) return freshState()
    return {
      products: parsed.products,
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      lowStock:
        typeof parsed.lowStock === 'number' && Number.isFinite(parsed.lowStock)
          ? parsed.lowStock
          : LOW_STOCK_DEFAULT,
    }
  } catch {
    return freshState()
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const product = state.products.find((p) => p.id === action.id)
      if (!product) return state
      const existing = state.cart.find((c) => c.id === action.id)
      const currentQty = existing ? existing.qty : 0
      const nextQty = Math.min(currentQty + action.qty, product.stock)
      if (nextQty <= currentQty) return state
      return {
        ...state,
        cart: existing
          ? state.cart.map((c) => (c.id === action.id ? { ...c, qty: nextQty } : c))
          : [...state.cart, { id: action.id, qty: nextQty }],
      }
    }
    case 'SET_CART_QTY': {
      const product = state.products.find((p) => p.id === action.id)
      if (!product) return state
      if (action.qty <= 0) return { ...state, cart: state.cart.filter((c) => c.id !== action.id) }
      const qty = Math.min(action.qty, product.stock)
      return { ...state, cart: state.cart.map((c) => (c.id === action.id ? { ...c, qty } : c)) }
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((c) => c.id !== action.id) }
    case 'CLEAR_CART':
      return { ...state, cart: [] }
    case 'CHECKOUT': {
      if (action.items.length === 0) return state
      const order = {
        id: action.orderId,
        at: action.at,
        items: action.items,
        total: action.total,
      }
      const sold = new Map(action.items.map((i) => [i.id, i.qty]))
      return {
        ...state,
        products: state.products.map((p) =>
          sold.has(p.id) ? { ...p, stock: Math.max(0, p.stock - sold.get(p.id)) } : p,
        ),
        orders: [order, ...state.orders].slice(0, 50),
        cart: [],
      }
    }
    case 'SAVE_PRODUCT': {
      const next = action.product
      const exists = state.products.some((p) => p.id === next.id)
      const normalized = {
        ...next,
        glyph: next.glyph || DEFAULT_GLYPHS[next.category] || '📦',
        rating: typeof next.rating === 'number' ? next.rating : 4.5,
        blurb: next.blurb || 'A new addition to the Northwind Supply range.',
      }
      return {
        ...state,
        products: exists
          ? state.products.map((p) => (p.id === next.id ? normalized : p))
          : [normalized, ...state.products],
      }
    }
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.id),
        cart: state.cart.filter((c) => c.id !== action.id),
      }
    case 'ADJUST_STOCK': {
      const product = state.products.find((p) => p.id === action.id)
      if (!product) return state
      const stock = Math.max(0, Math.min(9999, product.stock + action.delta))
      if (stock === product.stock) return state
      return { ...state, products: state.products.map((p) => (p.id === action.id ? { ...p, stock } : p)) }
    }
    case 'SET_STOCK': {
      const stock = Math.max(0, Math.min(9999, Math.round(Number(action.value) || 0)))
      return { ...state, products: state.products.map((p) => (p.id === action.id ? { ...p, stock } : p)) }
    }
    case 'SET_PRICE': {
      const price = Math.max(0, Math.min(99999, Math.round(Number(action.value) * 100) / 100))
      if (!Number.isFinite(price)) return state
      return { ...state, products: state.products.map((p) => (p.id === action.id ? { ...p, price } : p)) }
    }
    case 'SET_LOW_STOCK':
      return { ...state, lowStock: Math.max(0, Math.min(999, Math.round(action.value))) }
    case 'RESET_STORE':
      return freshState()
    default:
      return state
  }
}

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [toasts, setToasts] = useState([])
  const toastSeq = useRef(0)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or unavailable — the app still works in-memory */
    }
  }, [state])

  const toast = useCallback((message, tone = 'default') => {
    const id = ++toastSeq.current
    setToasts((t) => [...t, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3200)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const byId = useMemo(() => {
    const map = new Map()
    for (const p of state.products) map.set(p.id, p)
    return map
  }, [state.products])

  const cartLines = useMemo(
    () =>
      state.cart
        .map((c) => {
          const product = byId.get(c.id)
          return product ? { ...c, product, lineTotal: product.price * c.qty } : null
        })
        .filter(Boolean),
    [state.cart, byId],
  )

  const cartCount = cartLines.reduce((n, l) => n + l.qty, 0)
  const cartTotal = cartLines.reduce((n, l) => n + l.lineTotal, 0)

  const api = {
    state,
    cartLines,
    cartCount,
    cartTotal,
    toasts,
    toast,
    dismissToast,

    addToCart(id, qty = 1) {
      const product = byId.get(id)
      if (!product) return
      if (product.stock <= 0) {
        toast(`${product.name} is out of stock`, 'error')
        return
      }
      const already = state.cart.find((c) => c.id === id)?.qty ?? 0
      if (already + qty > product.stock) {
        toast(`Only ${product.stock} left of ${product.name}`, 'error')
        return
      }
      dispatch({ type: 'ADD_TO_CART', id, qty })
      toast(`Added ${product.name} to cart`, 'success')
    },
    setCartQty(id, qty) {
      dispatch({ type: 'SET_CART_QTY', id, qty: Math.round(qty) })
    },
    removeFromCart(id) {
      dispatch({ type: 'REMOVE_FROM_CART', id })
    },
    clearCart() {
      dispatch({ type: 'CLEAR_CART' })
    },
    checkout() {
      if (cartLines.length === 0) {
        toast('Your cart is empty', 'error')
        return null
      }
      const short = cartLines.find((l) => l.qty > l.product.stock)
      if (short) {
        toast(`${short.product.name} no longer has that much stock`, 'error')
        return null
      }
      const items = cartLines.map((l) => ({
        id: l.product.id,
        name: l.product.name,
        price: l.product.price,
        qty: l.qty,
      }))
      const total = cartTotal
      const order = {
        items,
        total,
        orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
        at: Date.now(),
      }
      dispatch({ type: 'CHECKOUT', ...order })
      toast('Order placed — inventory updated', 'success')
      return order
    },
    saveProduct(product) {
      dispatch({ type: 'SAVE_PRODUCT', product })
      toast(state.products.some((p) => p.id === product.id) ? 'Product updated' : 'Product added', 'success')
    },
    deleteProduct(id) {
      const product = byId.get(id)
      dispatch({ type: 'DELETE_PRODUCT', id })
      if (product) toast(`${product.name} removed`, 'default')
    },
    adjustStock(id, delta) {
      dispatch({ type: 'ADJUST_STOCK', id, delta })
    },
    setStock(id, value) {
      dispatch({ type: 'SET_STOCK', id, value })
    },
    setPrice(id, value) {
      dispatch({ type: 'SET_PRICE', id, value })
      toast('Price updated', 'success')
    },
    setLowStock(value) {
      dispatch({ type: 'SET_LOW_STOCK', value: Number(value) })
    },
    resetStore() {
      dispatch({ type: 'RESET_STORE' })
      toast('Catalog reset to seed data', 'default')
    },
  }

  return <ShopContext.Provider value={api}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>')
  return ctx
}

export function newProductId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `p-${crypto.randomUUID().slice(0, 8)}`
  return `p-${Math.random().toString(36).slice(2, 10)}`
}
