import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../components/Typography';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import Button from '../components/Button';
import Chip from '../components/Chip';
import PressableScale from '../components/PressableScale';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, radius } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignIn'>;
};

type Role = 'user' | 'agent' | 'admin';

const DEMOS: { role: Role; email: string; label: string }[] = [
  { role: 'user', email: 'user@example.com', label: 'signIn.fillUser' },
  { role: 'agent', email: 'agent@boninzu.com', label: 'signIn.fillAgent' },
  { role: 'admin', email: 'admin@boninzu.com', label: 'signIn.fillAdmin' },
];

export default function SignInScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('signIn.missingFields'));
      return;
    }

    setLoading(true);
    const result = await login(email, password, role);
    setLoading(false);

    if (result.success) {
      navigation.replace('Main');
    } else {
      Alert.alert(t('signIn.failedTitle'), result.error || t('signIn.invalidCredentials'));
    }
  };

  const fillDemo = (demoEmail: string, demoRole: Role) => {
    setEmail(demoEmail);
    setRole(demoRole);
    setPassword('');
  };

  return (
    <AuthLayout
      title={t('signIn.title')}
      subtitle={t('signIn.subtitle')}
      backIcon="close"
      onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('Main'))}
    >
      {/* Segmented role control */}
      <View style={styles.segmented}>
        {(['user', 'agent', 'admin'] as const).map((r) => (
          <PressableScale
            key={r}
            accessibilityRole="button"
            accessibilityState={{ selected: role === r }}
            scaleTo={0.96}
            onPress={() => setRole(r)}
            style={[styles.segment, role === r && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, role === r && styles.segmentTextActive]}>{t(`roles.${r}`)}</Text>
          </PressableScale>
        ))}
      </View>

      <Field
        label={t('signIn.email')}
        icon="mail-outline"
        placeholder={t('signIn.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
      />

      <Field
        label={t('signIn.password')}
        icon="lock-closed-outline"
        placeholder={t('signIn.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        passwordToggle
        textContentType="password"
        autoComplete="password"
        returnKeyType="go"
        onSubmitEditing={handleLogin}
      />

      <Button title={loading ? t('signIn.submitting') : t('signIn.submit')} onPress={handleLogin} loading={loading} style={styles.submit} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('signIn.noAccount')}</Text>
        <Text style={styles.link} accessibilityRole="link" onPress={() => navigation.navigate('SignUp')}>
          {t('signIn.signUpHere')}
        </Text>
      </View>

      {/* Demo credentials */}
      <View style={styles.demo}>
        <Text style={styles.demoTitle}>{t('signIn.demoTitle')}</Text>
        <View style={styles.demoChips}>
          {DEMOS.map((d) => (
            <Chip key={d.role} label={t(d.label)} icon="flash-outline" onPress={() => fillDemo(d.email, d.role)} />
          ))}
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  segmented: { flexDirection: 'row', backgroundColor: colors.separator, borderRadius: radius.md, padding: 4, marginBottom: 20 },
  segment: { flex: 1, minHeight: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  segmentTextActive: { color: colors.primary, fontWeight: '600' },
  submit: { marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 20 },
  footerText: { fontSize: 14, color: colors.textSecondary },
  link: { fontSize: 14, fontWeight: '600', color: colors.primary },
  demo: { marginTop: 28, padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface, gap: 12 },
  demoTitle: { fontSize: 12, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },
  demoChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
