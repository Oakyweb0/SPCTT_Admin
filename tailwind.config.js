/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        spctt: {
          primary: {
            DEFAULT: '#476EAC',
            hover: '#365a94',
            light: '#f0f4fa',
            subtle: 'rgba(71, 110, 172, 0.08)',
          },
          secondary: {
            DEFAULT: '#C0192B',
            hover: '#a11424',
            light: '#fdf1f2',
            subtle: 'rgba(192, 25, 43, 0.08)',
          },
          accent: {
            DEFAULT: '#0284c7',
            light: '#f0f9ff',
          },
          success: {
            DEFAULT: '#16a34a',
            light: '#f0fdf4',
          },
          warning: {
            DEFAULT: '#d97706',
            light: '#fffbeb',
          },
          dark: '#111827',
          body: '#334155',
          muted: '#64748b',
          'light-muted': '#94a3b8',
          bg: '#f4f6fa',
          'card-bg': '#ffffff',
          sidebar: {
            DEFAULT: '#0d1b38',
            text: '#cbd5e1',
            hover: 'rgba(255, 255, 255, 0.08)',
            active: '#476EAC',
            border: 'rgba(255, 255, 255, 0.08)',
          },
          border: {
            DEFAULT: '#e2e8f0',
            subtle: '#f1f5f9',
          },
          // Dark mode surfaces
          darkbg: '#090e1a',
          darkcard: '#111a2e',
          darksidebar: '#070b14',
          darkborder: '#1e293b',
        }
      },
      fontFamily: {
        title: ['Noto Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Jost', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'spctt-xs': '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
        'spctt-sm': '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        'spctt-md': '0 4px 10px -1px rgba(29, 55, 109, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.05)',
        'spctt-lg': '0 12px 24px -4px rgba(29, 55, 109, 0.1), 0 4px 8px -2px rgba(16, 24, 40, 0.04)',
        'spctt-card': '0 2px 8px rgba(29, 55, 109, 0.06)',
      },
      spacing: {
        'sidebar-w': '270px',
        'sidebar-collapsed': '78px',
        'header-h': '72px',
      }
    },
  },
  plugins: [],
};
