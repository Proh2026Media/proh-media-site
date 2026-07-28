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
        // Tipografia oficial (src/index.css): Mirano Extended = personalidade
        // (títulos); Gotham = apoio e leitura.
        sans: ['Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        gotham: ['Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        extended: ['Mirano Extended', 'Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
