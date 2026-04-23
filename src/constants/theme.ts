// ─── Midnight Voyage Design System ──────────────────────────────────────────
// Ported from kaizoku-client CSS variables — adapted for React Native

export const Colors = {
  // Backgrounds
  bgPrimary: '#05070a',
  bgSecondary: '#0b0e14',
  bgCard: '#11151c',
  bgCardHover: '#1a202c',
  bgGlass: 'rgba(5, 7, 10, 0.85)',
  bgInput: '#0f172a',

  // Accent — Captain's Gold
  accent: '#ffca28',
  accentHover: '#ffdf80',
  accentGlow: 'rgba(255, 202, 40, 0.25)',
  accentSecondary: '#38bdf8', // Ocean Blue

  // Text
  textPrimary: '#f8f9fa',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(255, 202, 40, 0.3)',

  // Status
  danger: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',

  // Overlay
  overlay: 'rgba(5, 7, 10, 0.7)',
  overlayHero: 'rgba(5, 7, 10, 0.5)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  // Font sizes (px equivalent)
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  hero: 40,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: {
    shadowColor: '#ffca28',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
} as const;
