import React, { useState } from 'react';
import { StyleSheet, TextInputProps, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text, TextInput } from './Typography';
import { colors, radius } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = TextInputProps & {
  label?: string;
  icon?: IconName;
  /** Adds a show/hide toggle; use together with secureTextEntry. */
  passwordToggle?: boolean;
};

/** Labelled input with a leading icon and a focus ring. */
export default function Field({ label, icon, passwordToggle, secureTextEntry, multiline, style, onFocus, onBlur, ...rest }: Props) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const secure = passwordToggle ? hidden : secureTextEntry;

  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.box, multiline && styles.boxMultiline, focused && styles.boxFocused]}>
        {icon ? (
          <Ionicons name={icon} size={20} color={focused ? colors.primary : colors.textMuted} style={multiline && styles.iconTop} />
        ) : null}
        <TextInput
          {...rest}
          multiline={multiline}
          secureTextEntry={secure}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline, style]}
        />
        {passwordToggle ? (
          <Pressable
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? t('common.showPassword') : t('common.hidePassword')}
            onPress={() => setHidden((h) => !h)}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, marginLeft: 4 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  boxMultiline: { alignItems: 'flex-start', paddingTop: 14 },
  boxFocused: { borderColor: colors.primary },
  iconTop: { marginTop: 1 },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  inputMultiline: { minHeight: 120, paddingTop: 0, textAlignVertical: 'top' },
});
