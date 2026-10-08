export function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export function stars(rating) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0))
  const full = Math.floor(r)
  const half = r - full >= 0.5
  return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)))
}

export function ago(timestamp) {
  const seconds = Math.round((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function stockLabel(stock, threshold) {
  if (stock <= 0) return { text: 'Out of stock', tone: 'rose' }
  if (stock <= threshold) return { text: 'Low stock', tone: 'amber' }
  return { text: 'In stock', tone: 'emerald' }
}
