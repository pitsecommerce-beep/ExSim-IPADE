/**
 * IPADE Design System · preset de Tailwind
 * Uso: en tailwind.config.js → presets: [require('./tokens/tailwind.preset.js')]
 * Los valores apuntan a las variables CSS de tokens.css, así el tema oscuro
 * (.ipd-theme-dark) funciona sin duplicar clases.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#00152B', 900: '#001F3D', 800: '#00284E', 700: '#00305B',
          600: '#14487A', 500: '#1E5A96', 400: '#4C82B8', 300: '#8AAFD3',
          200: '#C0D6E9', 100: '#E1ECF5', 50: '#F0F6FB',
        },
        gold: {
          900: '#6B5219', 800: '#8A6A24', 700: '#9C7A2C', 600: '#B08D3F',
          500: '#C6A65C', 400: '#D9BF86', 300: '#E9DDBF', 200: '#F3EDDC', 100: '#FAF7EF',
        },
        ink: {
          900: '#10141A', 800: '#20252C', 700: '#343B45', 600: '#4D5561',
          500: '#66707E', 400: '#9AA3B0', 300: '#C2C8D1', 200: '#DDE1E7',
          100: '#EFF1F4', 50: '#F7F8FA',
        },
        // Alias semánticos ligados a variables CSS
        surface: 'var(--ipd-bg-page)',
        'surface-subtle': 'var(--ipd-bg-subtle)',
        'surface-brand': 'var(--ipd-bg-brand)',
        'content-primary': 'var(--ipd-text-primary)',
        'content-secondary': 'var(--ipd-text-secondary)',
        'content-accent': 'var(--ipd-text-accent)',
        'stroke-subtle': 'var(--ipd-border-subtle)',
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '3xs': ['0.6875rem', { lineHeight: '1.5' }],
        '2xs': ['0.75rem', { lineHeight: '1.5' }],
        xs: ['0.8125rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.65' }],
        lg: ['1.125rem', { lineHeight: '1.65' }],
        xl: ['1.3125rem', { lineHeight: '1.28' }],
        '2xl': ['clamp(1.375rem, 1.25rem + 0.6vw, 1.625rem)', { lineHeight: '1.28' }],
        '3xl': ['clamp(1.625rem, 1.4rem + 1.1vw, 2rem)', { lineHeight: '1.28' }],
        '4xl': ['clamp(2rem, 1.6rem + 1.9vw, 2.5rem)', { lineHeight: '1.12' }],
        '5xl': ['clamp(2.25rem, 1.6rem + 3.1vw, 3.25rem)', { lineHeight: '1.12' }],
        '6xl': ['clamp(2.75rem, 1.6rem + 5.2vw, 4.5rem)', { lineHeight: '1.12' }],
      },
      letterSpacing: {
        tighter: '-0.02em', tight: '-0.01em', normal: '0',
        wide: '0.04em', wider: '0.12em',
      },
      spacing: {
        1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem',
        6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem',
        20: '5rem', 24: '6rem', 32: '8rem', 40: '10rem',
        section: 'clamp(3rem, 2rem + 5vw, 7.5rem)',
      },
      borderRadius: { none: '0', xs: '2px', sm: '4px', md: '8px', lg: '12px', xl: '20px', pill: '999px' },
      boxShadow: {
        xs: '0 1px 2px rgba(0,31,61,0.06)',
        sm: '0 2px 6px rgba(0,31,61,0.08)',
        md: '0 8px 20px rgba(0,31,61,0.10)',
        lg: '0 16px 40px rgba(0,31,61,0.14)',
        xl: '0 28px 64px rgba(0,31,61,0.18)',
        focus: '0 0 0 3px rgba(30,90,150,0.35)',
      },
      maxWidth: { container: '1200px', narrow: '760px', wide: '1440px', prose: '70ch' },
      screens: { xs: '360px', sm: '600px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1440px' },
      transitionDuration: { instant: '80ms', fast: '140ms', base: '220ms', slow: '340ms', deliberate: '520ms' },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2,0,0,1)',
        entrance: 'cubic-bezier(0,0,0,1)',
        exit: 'cubic-bezier(0.3,0,1,1)',
        emphasis: 'cubic-bezier(0.2,0,0,1.2)',
      },
      aspectRatio: { hero: '16 / 7', card: '585 / 295', portrait: '3 / 4' },
      zIndex: {
        base: '0', raised: '10', sticky: '100', header: '200', dropdown: '300',
        cta: '400', overlay: '500', modal: '600', toast: '700', tooltip: '800',
      },
    },
  },
};
