import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '../components/Typography';
import ScreenHeader from '../components/ScreenHeader';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Button from '../components/Button';
import { ListGroup, ListRow } from '../components/ListGroup';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/AppNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, radius, shadow } from '../theme';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Profile'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

export default function ProfileScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const signedIn = isAuthenticated && !!user;

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('nav.profile')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Identity card */}
        <View style={styles.identity}>
          <View style={styles.avatar}>
            {signedIn ? (
              <Text style={styles.avatarText}>{(user!.first_name?.charAt(0) || user!.username?.charAt(0) || 'U').toUpperCase()}</Text>
            ) : (
              <Ionicons name="person" size={30} color={colors.primary} />
            )}
          </View>
          <View style={styles.identityTexts}>
            <Text style={styles.name} numberOfLines={1}>
              {signedIn ? `${user!.first_name} ${user!.last_name}` : t('profile.guest')}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {signedIn ? user!.email : t('profile.notSignedIn')}
            </Text>
            {signedIn && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{t(`roles.${user!.role}`)}</Text>
              </View>
            )}
          </View>
        </View>

        {!signedIn && (
          <View style={styles.signInWrap}>
            <Button title={t('profile.signIn')} icon="log-in-outline" onPress={() => navigation.navigate('SignIn')} />
          </View>
        )}

        {signedIn && (
          <ListGroup title={t('profile.account')}>
            <ListRow icon="person-outline" label={t('profile.personalInfo')} />
            <ListRow icon="lock-closed-outline" label={t('profile.security')} tint={colors.success} tintBg={colors.successSoft} />
            <ListRow icon="notifications-outline" label={t('profile.notifications')} tint={colors.warning} tintBg={colors.warningSoft} />
          </ListGroup>
        )}

        <ListGroup title={t('profile.preferences')}>
          <View style={styles.languageBlock}>
            <ListRow icon="globe-outline" label={t('profile.language')} tint={colors.violet} tintBg={colors.violetSoft} />
            <View style={styles.languageSwitcher}>
              <LanguageSwitcher />
            </View>
          </View>
          <ListRow icon="moon-outline" label={t('profile.darkMode')} tint={colors.textSecondary} tintBg={colors.separator} />
        </ListGroup>

        <ListGroup title={t('profile.support')}>
          <ListRow icon="help-circle-outline" label={t('profile.helpCenter')} />
          <ListRow icon="document-text-outline" label={t('profile.terms')} tint={colors.textSecondary} tintBg={colors.separator} />
          <ListRow icon="shield-checkmark-outline" label={t('profile.privacy')} tint={colors.success} tintBg={colors.successSoft} />
        </ListGroup>

        {signedIn && (
          <ListGroup>
            <ListRow icon="log-out-outline" label={t('profile.signOut')} destructive onPress={() => logout()} />
          </ListGroup>
        )}

        <Text style={styles.version}>{t('profile.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 16,
    marginTop: 4,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26, fontWeight: '700', color: colors.primary },
  identityTexts: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  email: { fontSize: 13, color: colors.textSecondary },
  roleBadge: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  roleText: { color: colors.primary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  signInWrap: { paddingHorizontal: 16, marginTop: 16 },
  languageBlock: {},
  languageSwitcher: { paddingHorizontal: 16, paddingBottom: 14 },
  version: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 28 },
});
