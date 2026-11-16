import React from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from './Typography';
import LanguageSwitcher from './LanguageSwitcher';
import { colors } from '../theme';

type Props = {
  title: string;
  subtitle: string;
  onBack: () => void;
  backIcon?: 'chevron-back' | 'close';
  children: React.ReactNode;
};

/** Shared shell for sign-in / sign-up: keyboard-aware, brand header, safe-area aware. */
export default function AuthLayout({ title, subtitle, onBack, backIcon = 'chevron-back', children }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('details.goBack')}
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && { backgroundColor: colors.border }]}
          >
            <Ionicons name={backIcon} size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="home" size={30} color={colors.white} />
          </View>
          <Text style={styles.brand}>{t('common.brand')}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.body}>{children}</View>

        <View style={styles.language}>
          <LanguageSwitcher />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 16, height: 48, justifyContent: 'center' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  logo: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  brand: { fontSize: 14, fontWeight: '600', color: colors.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 26, lineHeight: 34, fontWeight: '700', color: colors.text, textAlign: 'center', letterSpacing: -0.4 },
  subtitle: { fontSize: 14, lineHeight: 21, color: colors.textSecondary, textAlign: 'center', marginTop: 6 },
  body: { paddingHorizontal: 20 },
  language: { alignItems: 'center', marginTop: 24 },
});
