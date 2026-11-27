/**
 * VantaCore Design Tokens
 * Recreated and adapted from the DotDNA dark-cybernetic editorial design language.
 */

export const tokens = {
  colors: {
    bg: {
      black: '#050605',
      void: '#070907',
      surface: '#090B09',
      elevated: '#0D120E',
      panel: '#111712',
      glass: 'rgba(9, 11, 9, 0.72)',
    },
    borders: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      mid: 'rgba(255, 255, 255, 0.14)',
      accent: 'rgba(112, 255, 94, 0.3)',
      accentGlow: 'rgba(112, 255, 94, 0.6)',
      danger: 'rgba(239, 68, 68, 0.4)',
      warning: 'rgba(245, 158, 11, 0.4)',
    },
    accent: {
      green: '#70FF5E',
      greenGlow: '#69FF57',
      greenDim: '#3CAE32',
      greenDark: '#0F2413',
      greenSubtle: 'rgba(112, 255, 94, 0.08)',
    },
    status: {
      allow: '#70FF5E',
      review: '#F59E0B',
      block: '#EF4444',
      quarantine: '#DC2626',
      neutral: '#8B9C8D',
    },
    text: {
      primary: '#EDEDED',
      secondary: '#8B9C8D',
      dim: '#4D5C50',
      accent: '#70FF5E',
    },
  },
  typography: {
    display: "'Syne', 'Plus Jakarta Sans', sans-serif",
    sans: "'Plus Jakarta Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  glows: {
    subtle: '0 0 25px -4px rgba(112, 255, 94, 0.18)',
    strong: '0 0 45px -8px rgba(112, 255, 94, 0.4)',
    heroBeam: 'radial-gradient(circle at 50% 0%, rgba(112, 255, 94, 0.22) 0%, rgba(112, 255, 94, 0.04) 40%, transparent 75%)',
  },
  transitions: {
    springFast: { type: 'spring', stiffness: 300, damping: 25 },
    springSmooth: { type: 'spring', stiffness: 120, damping: 20 },
    cubicEase: [0.16, 1, 0.3, 1],
  },
} as const;

export type VantaTokens = typeof tokens;
