import React, { useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '../components/Typography';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert(t('common.error'), t('signUp.missingFields'));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t('common.error'), t('signUp.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('signUp.passwordMismatch'));
      return;
    }

    if (!agreeTerms) {
      Alert.alert(t('common.error'), t('signUp.mustAgree'));
      return;
    }

    setLoading(true);
    const result = await signup({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
    });
    setLoading(false);

    if (result.success) {
      navigation.replace('Main');
    } else {
      Alert.alert(t('signUp.failedTitle'), result.error || t('signUp.genericError'));
    }
  };

  return (
    <AuthLayout title={t('signUp.title')} subtitle={t('signUp.subtitle')} onBack={() => navigation.goBack()}>
      <View style={styles.row}>
        <View style={styles.half}>
          <Field label={t('signUp.firstName')} placeholder={t('signUp.firstNamePlaceholder')} value={firstName} onChangeText={setFirstName} autoComplete="given-name" textContentType="givenName" />
        </View>
        <View style={styles.half}>
          <Field label={t('signUp.lastName')} placeholder={t('signUp.lastNamePlaceholder')} value={lastName} onChangeText={setLastName} autoComplete="family-name" textContentType="familyName" />
        </View>
      </View>

      <Field
        label={t('signUp.email')}
        icon="mail-outline"
        placeholder={t('signUp.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
      />

      <Field
        label={t('signUp.phone')}
        icon="call-outline"
        placeholder={t('signUp.phonePlaceholder')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
      />

      <Field
        label={t('signUp.password')}
        icon="lock-closed-outline"
        placeholder={t('signUp.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        passwordToggle
        textContentType="newPassword"
      />
      <Text style={styles.hint}>{t('signUp.passwordHint')}</Text>

      <Field
        label={t('signUp.confirmPassword')}
        icon="lock-closed-outline"
        placeholder={t('signUp.confirmPasswordPlaceholder')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        passwordToggle
        textContentType="newPassword"
      />

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreeTerms }}
        onPress={() => setAgreeTerms(!agreeTerms)}
        style={styles.checkbox}
      >
        <View style={[styles.checkboxBox, agreeTerms && styles.checkboxChecked]}>
          {agreeTerms && <Ionicons name="checkmark" size={16} color={colors.white} />}
        </View>
        <Text style={styles.checkboxLabel}>{t('signUp.agreeTerms')}</Text>
      </Pressable>

      <Button title={loading ? t('signUp.submitting') : t('signUp.submit')} onPress={handleSignup} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('signUp.haveAccount')}</Text>
        <Text style={styles.link} accessibilityRole="link" onPress={() => navigation.navigate('SignIn')}>
          {t('signUp.signInHere')}
        </Text>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: -8, marginBottom: 16, marginLeft: 4 },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 12 },
  checkboxBox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxLabel: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 20 },
  footerText: { fontSize: 14, color: colors.textSecondary },
  link: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
