import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '../components/Typography';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/AppNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, radius, shadow } from '../theme';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const INFO: { icon: IconName; tint: string; bg: string; title: string; text: string }[] = [
  { icon: 'bookmark', tint: colors.primary, bg: colors.primarySoft, title: 'dashboard.savedTitle', text: 'dashboard.savedText' },
  { icon: 'person-circle', tint: colors.success, bg: colors.successSoft, title: 'dashboard.profileTitle', text: 'dashboard.profileText' },
  { icon: 'sparkles', tint: colors.violet, bg: colors.violetSoft, title: 'dashboard.recommendationsTitle', text: 'dashboard.recommendationsText' },
];

export default function DashboardScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('nav.dashboard')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Welcome card */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeLabel}>{t('dashboard.welcomeBack')}</Text>
          <Text style={styles.welcomeName}>{user?.first_name || user?.username}</Text>
          <View style={styles.rolePill}>
            <Ionicons name="shield-checkmark" size={14} color={colors.white} />
            <Text style={styles.roleText}>{user?.role ? t(`roles.${user.role}`) : ''}</Text>
          </View>

          {user?.role === 'admin' && <Button title={t('dashboard.openAdmin')} variant="secondary" style={styles.cta} />}
          {user?.role === 'agent' && <Button title={t('dashboard.manageListings')} variant="secondary" style={styles.cta} />}
          {user?.role === 'user' && (
            <Button title={t('dashboard.discover')} variant="secondary" style={styles.cta} onPress={() => navigation.navigate('Properties')} />
          )}
        </View>

        {/* Info cards */}
        <View style={styles.card}>
          {INFO.map((item, i) => (
            <View key={item.title} style={[styles.infoRow, i > 0 && styles.divider]}>
              <View style={[styles.infoIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.tint} />
              </View>
              <View style={styles.infoTexts}>
                <Text style={styles.infoTitle}>{t(item.title)}</Text>
                <Text style={styles.infoText}>{t(item.text)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* What's next */}
        <Text style={styles.sectionTitle}>{t('dashboard.whatsNext')}</Text>
        <View style={styles.card}>
          {['dashboard.next1', 'dashboard.next2', 'dashboard.next3'].map((key, i) => (
            <View key={key} style={[styles.stepRow, i > 0 && styles.divider]}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{t(key)}</Text>
            </View>
          ))}
        </View>

        <Button title={t('dashboard.signOut')} icon="log-out-outline" variant="danger" onPress={() => logout()} style={styles.signOut} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  welcome: { padding: 22, borderRadius: radius.xl, backgroundColor: colors.primary },
  welcomeLabel: { fontSize: 14, color: '#dbeafe' },
  welcomeName: { fontSize: 28, lineHeight: 38, fontWeight: '700', color: colors.white, letterSpacing: -0.4 },
  rolePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.2)' },
  roleText: { fontSize: 12, fontWeight: '600', color: colors.white, textTransform: 'uppercase' },
  cta: { marginTop: 20 },
  card: { marginTop: 16, borderRadius: radius.lg, backgroundColor: colors.surface, ...shadow.card },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  infoRow: { flexDirection: 'row', gap: 14, padding: 16 },
  infoIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  infoTexts: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  infoText: { fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 28, letterSpacing: -0.3 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  stepText: { flex: 1, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  signOut: { marginTop: 24 },
});
