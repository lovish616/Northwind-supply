export default function ProductArt({ product, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${product.tint || 'from-slate-400 to-slate-300'} ${className}`}
      aria-hidden="true"
    >
      <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/25" />
      <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-white/15" />
      <span className="relative select-none text-5xl drop-shadow-sm sm:text-6xl">{product.glyph || '📦'}</span>
    </div>
  )
}
