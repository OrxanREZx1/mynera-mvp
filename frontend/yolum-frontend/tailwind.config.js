/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1320px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          50: '#FBF7FE',
          100: '#F3E8FA',
          200: '#EAD4F5',
          300: '#D9A6E9',
          400: '#CC8CE0',
          500: '#BC70DA', // brand purple — main accent
          600: '#9E4DB8',
          700: '#833F99',
          800: '#67317A',
          900: '#4D255C',
          DEFAULT: '#BC70DA',
          foreground: '#ffffff',
        },
        ink: {
          50: '#F7F7F7',
          100: '#F4F4F4',
          200: '#EEEEEE',
          300: '#D9D9D9',
          400: '#B3B3B3',
          500: '#A0A0A0',
          600: '#696969',
          700: '#565555',
          800: '#1A1A1A',
          900: '#0F0F0F',
        },
        success: {
          50: '#F0FAF0',
          500: '#00B000',
          600: '#009000',
        },
        danger: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F8C700',
          600: '#D6A900',
        },
        secondary: {
          DEFAULT: '#F4F4F4',
          foreground: '#1A1A1A',
        },
        muted: {
          DEFAULT: '#F7F7F7',
          foreground: '#696969',
        },
        accent: {
          DEFAULT: '#F3E8FA',
          foreground: '#4D255C',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1A1A1A',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"DM Serif Text"', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '20px' }],
        md: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '26px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['32px', { lineHeight: '40px' }],
        '5xl': ['38px', { lineHeight: '46px' }],
        '6xl': ['50px', { lineHeight: '58px' }],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        md: '15px',
        lg: '20px',
        xl: '25px',
        '2xl': '30px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,26,26,0.04), 0 4px 16px rgba(26,26,26,0.06)',
        'card-hover': '0 4px 8px rgba(26,26,26,0.06), 0 12px 28px rgba(26,26,26,0.10)',
        glow: '0 8px 30px rgba(188,112,218,0.25)',
        pop: '0 20px 60px rgba(26,26,26,0.16)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-4px)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.6s infinite linear',
        'typing-dot': 'typing-dot 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
