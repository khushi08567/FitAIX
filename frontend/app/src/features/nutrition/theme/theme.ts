// ─── Apex Noir Theme Design Tokens ──────────────────────────────────────────

export const APEX_NOIR = {
  // Backgrounds
  bgDark: '#12110D', // Pitch warm black/noir background
  cardBg: '#1C1A14', // Ultra deep warm dark card
  cardBgLight: '#24221B', // Slightly elevated card background
  cardBorder: 'rgba(255, 214, 10, 0.15)', // Subtle gold-tinged border
  inputBg: '#171611', // Input container background

  // Brand Palette (from Apex Noir spec image)
  primary: '#FFD60A', // Apex Electric Gold / Yellow
  secondary: '#F5C400', // Deep Gold Accent
  tertiary: '#00F0FC', // Electric Cyan Blue Accent
  neutral: '#7C7767', // Muted Muted Warm Grey

  // Functional Colors
  success: '#00F0FC', // Cyan Accent
  warning: '#FFD60A', // Gold Accent
  danger: '#FF6B6B', // Soft Coral Red
  info: '#00F0FC',

  // Typography (warm cream text tones)
  textPrimary: '#F2EFE9', // Off-white cream headline text
  textSecondary: '#A6A090', // Warm muted grey body text
  textMuted: '#7C7767', // Neutral grey label text
  textInverse: '#12110D', // Dark text on gold buttons

  // Gradient definitions
  goldGradient: ['#FFD60A', '#F5C400'],
  cyanGradient: ['#00F0FC', '#00B8D4'],
} as const;
