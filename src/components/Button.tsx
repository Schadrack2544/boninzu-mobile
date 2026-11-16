import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Typography';
import PressableScale from './PressableScale';
import { colors, radius } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'tonal' | 'danger' | 'ghost' | 'inverse';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const palette = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
  tonal: { bg: colors.primarySoft, fg: colors.primary, border: colors.primarySoft },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  inverse: { bg: 'transparent', fg: colors.white, border: 'rgba(255,255,255,0.6)' },
} as const;

export default function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style }: Props) {
  const p = palette[variant];
  const inactive = disabled || loading;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={inactive ? undefined : onPress}
      style={[styles.base, { backgroundColor: p.bg, borderColor: p.border }, inactive && styles.inactive, style]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={20} color={p.fg} /> : null}
          <Text style={[styles.label, { color: p.fg }]}>{title}</Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  inactive: { opacity: 0.6 },
});
