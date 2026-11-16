import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Typography';
import { AppLanguage, SUPPORTED_LANGUAGES, setLanguage } from '../i18n';

type Props = {
  /** Use on top of the blue header (white chips) instead of on a white card. */
  onDark?: boolean;
};

export default function LanguageSwitcher({ onDark = false }: Props) {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <View style={styles.row}>
      {SUPPORTED_LANGUAGES.map((code: AppLanguage) => {
        const active = current === code;
        return (
          <TouchableOpacity
            key={code}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.chip,
              onDark ? styles.chipOnDark : styles.chipOnLight,
              active && (onDark ? styles.chipActiveOnDark : styles.chipActiveOnLight),
            ]}
            onPress={() => setLanguage(code)}
          >
            <Text
              style={[
                styles.chipText,
                onDark ? styles.textOnDark : styles.textOnLight,
                active && (onDark ? styles.textActiveOnDark : styles.textActiveOnLight),
              ]}
            >
              {t(`languages.${code}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  chipOnLight: { backgroundColor: '#f4f6fa', borderColor: '#e2e8f0' },
  chipActiveOnLight: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipOnDark: { backgroundColor: 'transparent', borderColor: '#bfdbfe' },
  chipActiveOnDark: { backgroundColor: '#ffffff', borderColor: '#ffffff' },
  chipText: { fontSize: 12, fontWeight: '600' },
  textOnLight: { color: '#6b7280' },
  textActiveOnLight: { color: '#ffffff' },
  textOnDark: { color: '#dbeafe' },
  textActiveOnDark: { color: '#2563eb' },
});
