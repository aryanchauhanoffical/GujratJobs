/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // shadcn/ui CSS-variable bridge
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        // shadcn primary/accent (CSS vars) merged with existing brand shades
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        gujarat: {
          saffron: '#FF9933',
          green: '#138808',
          blue: '#000080',
        },
        // GujaratJobs brand tokens — Disciplined warmth (BMW × Starbucks × Gujarat)
        saffron: {
          DEFAULT: '#C44A0F',
          active: '#A23A0A',
          disabled: '#E8C4B0',
        },
        marigold: {
          DEFAULT: '#F59E0B',
          soft: '#FCD34D',
        },
        canvas: {
          DEFAULT: '#FFFFFF',
          warm: '#FBF7F0',
        },
        surface: {
          soft: '#F7F7F7',
          card: '#FAFAFA',
          dark: '#1A1A1A',
          'dark-elevated': '#262E38',
        },
        ink: '#1A1A1A',
        body: '#3C3C3C',
        'muted-text': '#6B6B6B',
        'muted-soft': '#9A9A9A',
        hairline: {
          DEFAULT: '#E6E6E6',
          strong: '#CCCCCC',
        },
        'on-primary': '#FFFFFF',
        'on-dark': '#FFFFFF',
        success: {
          DEFAULT: '#0B7B3F',
          soft: '#D4ECDA',
        },
        warning: '#F59E0B',
        error: {
          DEFAULT: '#DC2626',
          soft: '#FCE7E7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Restrained — only two shadow tiers per DESIGN.md §6
        card: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        modal: '0 8px 16px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.12)',
        // Legacy
        'card-hover': '0 10px 40px -10px rgba(196, 74, 15, 0.15)',
      },
      fontWeight: {
        // Two-weight discipline (BMW). Anything outside 400/700 is wrong.
        normal: '400',
        bold: '700',
      },
      letterSpacing: {
        // BMW + Starbucks blend — tight, confident
        tighter: '-0.02em',
        tight: '-0.018em',
        snug: '-0.014em',
        normal: '-0.011em',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
