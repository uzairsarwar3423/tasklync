export const fontFamily = {
  // Brand / Display / CTAs
  poppins: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    extraBold: 'Poppins-ExtraBold',
  },
  // Body / UI
  jakarta: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semiBold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },
  // Data / Numbers
  inter: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    extraBold: 'Inter-ExtraBold',
  },
};

export const fontSize = {
  display: 36,
  h1: 28,
  h2: 22,
  h3: 18,
  h4: 16,
  body1: 16,
  body2: 14,
  label: 14,
  caption: 12,
  micro: 11,
  nano: 10,
  dataXL: 28,
  dataLG: 20,
  dataMD: 16,
  dataSM: 13,
  dataXS: 11,
};

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.2,
  wider: 0.5,
  widest: 1.0,
};

export const textStyles = {
  display: {
    fontFamily: fontFamily.poppins.bold,
    fontSize: fontSize.display,
    lineHeight: 44,
    letterSpacing: letterSpacing.tight,
  },
  h1: {
    fontFamily: fontFamily.poppins.bold,
    fontSize: fontSize.h1,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fontFamily.poppins.bold,
    fontSize: fontSize.h2,
    lineHeight: 30,
  },
  h3: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h3,
    lineHeight: 26,
  },
  h4: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h4,
    lineHeight: 24,
  },
  body1: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.body1,
    lineHeight: 24,
    letterSpacing: letterSpacing.normal,
  },
  body2: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.body2,
    lineHeight: 20,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: fontSize.label,
    lineHeight: 20,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.caption,
    lineHeight: 18,
    letterSpacing: letterSpacing.wide,
  },
  micro: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: fontSize.micro,
    lineHeight: 16,
    letterSpacing: letterSpacing.wider,
  },
  nano: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: fontSize.nano,
    lineHeight: 14,
    letterSpacing: letterSpacing.wider,
  },
  dataXL: {
    fontFamily: fontFamily.inter.bold,
    fontSize: fontSize.dataXL,
    lineHeight: 36,
  },
  dataLG: {
    fontFamily: fontFamily.inter.bold,
    fontSize: fontSize.dataLG,
    lineHeight: 28,
  },
  dataMD: {
    fontFamily: fontFamily.inter.semiBold,
    fontSize: fontSize.dataMD,
    lineHeight: 24,
  },
  dataSM: {
    fontFamily: fontFamily.inter.medium,
    fontSize: fontSize.dataSM,
    lineHeight: 20,
  },
  dataXS: {
    fontFamily: fontFamily.inter.regular,
    fontSize: fontSize.dataXS,
    lineHeight: 16,
  },
};

export const typography = {
  fontFamily,
  fontSize,
  letterSpacing,
  textStyles,
};
