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
          50: '#FAF6EF',   // Warm Cream Page Background
          100: '#F5EFE4',  // Soft Cream Secondary
          200: '#E6D8C3',  // Subtle Warm Border
          300: '#D6C2A3',  // Warm Sand / Input Border
          400: '#D48A1C',  // Warm Amber / Mustard
          500: '#B84A14',  // Terracotta Primary
          600: '#A03813',  // Rust Primary
          700: '#8A2E0E',  // Deep Rust Hover
          800: '#473621',  // Deep Earth Brown
          900: '#2C2115',  // Dark Espresso (Sidebar & Main Text)
          950: '#1F170E',  // Deepest Espresso
        },
        surface: {
          DEFAULT: '#FFFDF9',
          cream: '#F5EFE4',
          page: '#FAF6EF',
        },
        caramel: {
          DEFAULT: '#AD5D1E',
          light: '#C4832B',
          gold: '#D48A1C',
        },
        oliveDark: {
          DEFAULT: '#4B4118',
        },
        sage: {
          50: '#F4F7F2',
          100: '#E3EBE0',
          500: '#556B2F',  // Olive / Sage Green
          600: '#435424',
          700: '#3B4A20',
        },
        amberGold: {
          50: '#FFFBF2',
          100: '#F9EEDB',
          200: '#EED4A6',
          300: '#E5BE7A',
          500: '#D48A1C',  // Warm Mustard Amber
          600: '#C4832B',  // Caramel Gold
          700: '#AD5D1E',  // Deep Caramel
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'autumn-sm': '0 1px 3px rgba(44, 33, 21, 0.06)',
        'autumn-md': '0 4px 12px rgba(44, 33, 21, 0.09)',
        'autumn-lg': '0 10px 25px rgba(44, 33, 21, 0.13)',
      },
    },
  },
  plugins: [],
};
