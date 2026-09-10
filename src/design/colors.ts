export const palette = {
  // Primary (Green scale)
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green300: '#86EFAC',
  green400: '#4ADE80',
  green500: '#22C55E', // primary
  green600: '#16A34A', // primaryDark
  green700: '#15803D',
  green800: '#166534',
  green900: '#14532D',

  // Neutrals
  white: '#FFFFFF',
  zenWhite: '#F6F7F9', // bgApp canvas
  canvasGray: '#F6F7F9', // #F6F7F9 universal app canvas
  lowGray: '#F8F9FA', // bgSection
  iceGray: '#F4F5F7', // bgInput
  mintHaze: '#EFF0F3', // bgSkeleton
  softGray: '#E2E8F0', // border

  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1', // textDisabled
  gray400: '#94A3B8', // textMuted
  gray500: '#64748B',
  gray600: '#475569', // textSecondary
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A', // textPrimary

  // Semantics raw
  warningLight: '#FEF3C7',
  warning: '#F59E0B',
  warningDark: '#92400E',
  dangerLight: '#FEF2F2',
  danger: '#EF4444',
  dangerDark: '#991B1B',
  infoLight: '#EFF6FF',
  info: '#3B82F6',
  infoDark: '#1E40AF',
};

export const colors = {
  // Brand
  primary: palette.green500,
  primaryDark: palette.green600,
  primaryLight: palette.green400,
  primaryTint: palette.green50,
  primaryBorder: palette.green200,

  // Backgrounds
  bgApp: palette.canvasGray, // #F6F7F9 universal app background
  bgHome: palette.canvasGray, // #F6F7F9
  bgCard: palette.white,
  bgInput: palette.iceGray,
  bgSection: palette.lowGray,
  bgSuccess: palette.green50,
  bgSkeleton: palette.mintHaze,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textMuted: palette.gray400,
  textDisabled: palette.gray300,
  textOnGreen: palette.white,
  textGreen: palette.green700,
  textDanger: palette.danger,
  textWarning: palette.warningDark,

  // Borders
  border: palette.softGray,
  borderFocus: palette.green600,
  borderError: palette.danger,
  borderSuccess: palette.green500,

  // Status indicators
  online: palette.green500,
  offline: palette.gray400,
  busy: palette.warning,
};

export const bookingStatusColors = {
  PENDING: {
    bg: palette.warningLight,
    border: palette.warning,
    text: palette.warningDark,
    dot: palette.warning,
  },
  ACCEPTED: {
    bg: palette.infoLight,
    border: palette.info,
    text: palette.infoDark,
    dot: palette.info,
  },
  IN_PROGRESS: {
    bg: palette.green50,
    border: palette.green500,
    text: palette.green900,
    dot: palette.green500,
  },
  COMPLETED: {
    bg: palette.gray50,
    border: palette.gray300,
    text: palette.gray600,
    dot: palette.gray400,
  },
  CANCELLED: {
    bg: palette.dangerLight,
    border: palette.danger,
    text: palette.dangerDark,
    dot: palette.danger,
  },
};

export type ColorKey = keyof typeof colors;
