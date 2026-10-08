/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.06), 0 8px 24px -12px rgba(16,24,40,.18)',
        drawer: '-24px 0 60px -24px rgba(16,24,40,.35)',
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'pop-in': {
          from: { transform: 'scale(.96)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'toast-in': {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in .28s cubic-bezier(.2,.8,.2,1)',
        'pop-in': 'pop-in .18s ease-out',
        'fade-in': 'fade-in .18s ease-out',
        'toast-in': 'toast-in .2s ease-out',
      },
    },
  },
  plugins: [],
}
