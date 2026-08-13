/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        autumn: {
          50: '#FDFBF7',   // Warm Cream Background
          100: '#F5EFE6',  // Soft Sand
          200: '#EFE6D5',  // Warm Border/Card
          300: '#E2D1B8',  // Soft Ochre Accent
          400: '#D97706',  // Amber Warm Accent
          500: '#C85A32',  // Terracotta Primary
          600: '#9E3B1B',  // Rust Dark Primary
          700: '#732A13',  // Deep Rust
          800: '#4A3E3D',  // Soft Warm Charcoal
          900: '#2C221E',  // Dark Wood Text
        },
        sage: {
          50: '#F4F7F2',
          100: '#E3EBE0',
          500: '#556B2F',  // Olive / Sage Green
          600: '#435424',
          700: '#3B4A20',
        },
        amberGold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#D97706',  // Golden Amber
          600: '#B45309',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'autumn-sm': '0 1px 3px rgba(44, 34, 30, 0.05)',
        'autumn-md': '0 4px 12px rgba(44, 34, 30, 0.08)',
        'autumn-lg': '0 10px 25px rgba(44, 34, 30, 0.12)',
      }
    },
  },
  plugins: [],
};
