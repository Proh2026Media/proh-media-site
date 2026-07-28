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
        // Tipografia oficial (src/index.css): Gotham em títulos e leitura;
        // Mirano Extended reservada ao nome da marca (PROH/PH) e slogans.
        sans: ['Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        gotham: ['Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        extended: ['Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mirano: ['Mirano Extended', 'Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
