/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './landing_page_proh.tsx',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Fonte oficial da marca: Gotham (declarada em src/index.css).
        sans: ['Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        gotham: ['Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        extended: ['Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
