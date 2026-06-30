/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        cream: '#f8f5ef',
        moss: '#10473f',
        clay: '#c96c4a',
        sand: '#eadfcf',
        line: '#d9cec0'
      },
      boxShadow: {
        soft: '0 20px 50px rgba(16, 24, 40, 0.08)',
        lift: '0 12px 30px rgba(16, 24, 40, 0.12)'
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top left, rgba(16,71,63,0.18), transparent 35%), radial-gradient(circle at top right, rgba(201,108,74,0.18), transparent 30%), linear-gradient(180deg, #f8f5ef 0%, #fffaf4 100%)'
      }
    }
  },
  plugins: []
};

