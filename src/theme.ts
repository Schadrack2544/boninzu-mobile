import { Platform, ViewStyle } from 'react-native';

export const colors = {
  primary: '#2563eb',
  primaryPressed: '#1d4ed8',
  primarySoft: '#e8f0ff',
  bg: '#f4f6fa',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  separator: '#eef1f6',
  danger: '#ef4444',
  dangerSoft: '#fee2e2',
  success: '#16a34a',
  successSoft: '#dcfce7',
  warning: '#f59e0b',
  warningSoft: '#fef3c7',
  violet: '#7c3aed',
  violetSoft: '#ede9fe',
  white: '#ffffff',
  scrim: 'rgba(15, 23, 42, 0.45)',
} as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

/** Minimum comfortable touch target (Apple HIG 44pt / Material 48dp). */
export const HIT = 48;

const shadowBase = Platform.select<ViewStyle>({
  ios: { shadowColor: '#0f172a' },
  default: { shadowColor: '#0f172a' },
}) as ViewStyle;

export const shadow = {
  card: {
    ...shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  } as ViewStyle,
  floating: {
    ...shadowBase,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
};

export const formatPriceNumber = (price: number) => price.toLocaleString();
