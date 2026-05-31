/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand & Accent
        primary: '#0066cc',
        'primary-focus': '#0071e3',
        'primary-dark': '#2997ff',
        // Ink / Text
        ink: '#1d1d1f',
        'ink-80': '#333333',
        'ink-48': '#7a7a7a',
        'body-muted': '#cccccc',
        // Canvas / Surface
        canvas: '#ffffff',
        parchment: '#f5f5f7',
        pearl: '#fafafc',
        'tile-1': '#272729',
        'tile-2': '#2a2a2c',
        'tile-3': '#252527',
        'surface-black': '#000000',
        'chip-gray': '#d2d2d7',
        // Borders
        hairline: '#e0e0e0',
        divider: '#f0f0f0',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        xs: '5px',
        sm: '8px',
        md: '11px',
        lg: '18px',
        pill: '9999px',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '17px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        section: '80px',
      },
      boxShadow: {
        product: 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0px',
        card: '0 0 0 1px rgba(0,0,0,0.08)',
      },
      backdropBlur: {
        nav: '20px',
      },
      letterSpacing: {
        'display': '-0.028em',
        'display-md': '-0.011em',
        'body': '-0.022em',
        'caption': '-0.016em',
        'nav': '-0.012em',
      },
      lineHeight: {
        'hero': '1.07',
        'display': '1.1',
        'display-md': '1.47',
        'lead': '1.14',
        'body': '1.47',
        'dense': '2.41',
      },
      maxWidth: {
        content: '980px',
        wide: '1440px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-ring': 'pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '80%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1.5)' },
        },
      },
    },
  },
  plugins: [],
};
