export const colors = {
  background: '#F4F6F9',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F6',
  surfaceHover: '#E8ECF1',
  text: '#172026',
  textMuted: '#68737D',
  textLight: '#9CA3AF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  primary: '#0B7A75',
  primaryDark: '#075E59',
  primaryLight: '#E0F2F1',
  primarySoft: '#B2DFDB',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  dangerSoft: '#FECACA',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  success: '#059669',
  successLight: '#D1FAE5',
  info: '#2563EB',
  infoLight: '#DBEAFE',
  shadow: 'rgba(0,0,0,0.08)',
  shadowDark: 'rgba(0,0,0,0.12)',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};
