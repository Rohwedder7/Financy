/**
 * Style Guide hex (Figma `3:377`). Keep in sync with `@theme` in `index.css`.
 * AC-002: components import from here instead of scattering literals.
 */
export const styleGuide = {
  brandDark: '#184835',
  brand: '#125E3F',
  brandLight: '#229367',
  ink: '#161719',
  inkSoft: '#23262F',
  inkMid: '#353945',
  muted: '#777E90',
  line: '#B1B5C3',
  border: '#E6E8EC',
  canvas: '#F4F5F6',
  surface: '#FCFCFD',
  white: '#FFFFFF',
  danger: '#EF466F',
  warning: '#FFD166',
  success: '#45B36B',
} as const

export const categorySwatches: readonly string[] = [
  styleGuide.brandDark,
  styleGuide.brand,
  styleGuide.brandLight,
  styleGuide.danger,
  styleGuide.warning,
  styleGuide.success,
  styleGuide.inkMid,
  styleGuide.muted,
]
