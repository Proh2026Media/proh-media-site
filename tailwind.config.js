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
        // Brand fonts fall back gracefully until the licensed files are added.
        mirano: ['Mirano', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        extended: ['Extended', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
