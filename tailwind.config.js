/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#167a42',
          700: '#15803d',
          800: '#166534',
          900: '#0e5c30',
        },
        app: {
          bg: '#f4f7f4',
          card: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
