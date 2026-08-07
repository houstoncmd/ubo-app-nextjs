/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lhb: {
          navy: '#0f172a',
          'navy-light': '#1e293b',
          'navy-mid': '#334155',
          gold: '#f59e0b',
          'gold-light': '#fbbf24',
          primary: '#2563eb',
          success: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          info: '#06b6d4',
          bg: '#f1f5f9',
          surface: '#ffffff',
          border: '#e2e8f0',
          text: '#1e293b',
          'text-secondary': '#64748b',
        },
      },
      fontFamily: {
        lhb: ['"Noto Sans Thai"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
