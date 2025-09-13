/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-ring': 'pulseRing 2s infinite',
        'modal-enter': 'modalEnter 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.33)' },
          '80%, 100%': { opacity: '0' },
        },
        modalEnter: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}