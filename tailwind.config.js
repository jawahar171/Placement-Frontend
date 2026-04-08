/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        ink: {
          900: '#0f0e17',
          800: '#1a1a2e',
          700: '#232341',
          600: '#2d2d5a',
          500: '#3d3d73',
        },
        gold: {
          50:  '#fefbf0',
          100: '#fdf3d0',
          200: '#fbe59e',
          300: '#f8d05c',
          400: '#f5bc28',
          500: '#e2a800',
          600: '#c49000',
          700: '#a07200',
          800: '#7c5800',
          900: '#5a3f00',
        },
        slate: {
          950: '#0b1120'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 12px 32px rgba(0,0,0,0.08)',
        'glow': '0 0 0 3px rgba(226,168,0,0.2)',
      }
    },
  },
  plugins: [],
}
