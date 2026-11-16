import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '../components/Typography';
import PressableScale from '../components/PressableScale';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/Button';
import { propertyApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/AppNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, radius, shadow } from '../theme';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORIES: { type: string; icon: IconName }[] = [
  { type: 'house', icon: 'home-outline' },
  { type: 'apartment', icon: 'business-outline' },
  { type: 'office', icon: 'briefcase-outline' },
  { type: 'land', icon: 'leaf-outline' },
];

const REASONS: { icon: IconName; tint: string; bg: string; title: string; text: string }[] = [
  { icon: 'shield-checkmark', tint: colors.success, bg: colors.successSoft, title: 'home.verifiedTitle', text: 'home.verifiedText' },
  { icon: 'flash', tint: colors.warning, bg: colors.warningSoft, title: 'home.fastTitle', text: 'home.fastText' },
  { icon: 'ribbon', tint: colors.violet, bg: colors.violetSoft, title: 'home.expertTitle', text: 'home.expertText' },
];

const CARD_GAP = 14;

export default function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, isAuthenticated } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cardWidth = Math.min(width * 0.78, 340);

  const loadFeaturedProperties = useCallback(async () => {
    try {
      const response = await propertyApi.getFeaturedProperties(6);
      if (response.records) {
        setFeaturedProperties(response.records);
      }
    } catch (error) {
      console.error('Error loading featured properties:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedProperties();
  }, [loadFeaturedProperties]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeaturedProperties();
    setRefreshing(false);
  };

  const initial = (user?.first_name || user?.username || '').charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTexts}>
          <Text style={styles.greeting}>
            {isAuthenticated && user ? t('home.hello', { name: user.first_name || user.username }) : t('home.welcomeGuest')}
          </Text>
          <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('nav.profile')}
          onPress={() => navigation.navigate('Profile')}
          style={styles.avatar}
        >
          {initial ? <Text style={styles.avatarText}>{initial}</Text> : <Ionicons name="person" size={20} color={colors.primary} />}
        </Pressable>
      </View>

      {/* Search pill */}
      <PressableScale
        accessibilityRole="search"
        onPress={() => navigation.navigate('Properties')}
        scaleTo={0.985}
        style={styles.searchPill}
      >
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          {t('properties.searchPlaceholder')}
        </Text>
        <View style={styles.searchFilter}>
          <Ionicons name="options-outline" size={18} color={colors.white} />
        </View>
      </PressableScale>

      {/* Categories */}
      <View style={styles.categories}>
        {CATEGORIES.map((c) => (
          <PressableScale
            key={c.type}
            accessibilityRole="button"
            onPress={() => navigation.navigate('Properties', { type: c.type })}
            style={styles.category}
            scaleTo={0.93}
          >
            <View style={styles.categoryIcon}>
              <Ionicons name={c.icon} size={24} color={colors.primary} />
            </View>
            <Text style={styles.categoryLabel} numberOfLines={1}>
              {t(`properties.types.${c.type}`)}
            </Text>
          </PressableScale>
        ))}
      </View>

      {/* Featured */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.featuredProperties')}</Text>
        <Pressable hitSlop={10} accessibilityRole="button" onPress={() => navigation.navigate('Properties')}>
          <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : featuredProperties.length > 0 ? (
        <FlatList
          horizontal
          data={featuredProperties}
          keyExtractor={(p) => p.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + CARD_GAP}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={styles.carousel}
          ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              width={cardWidth}
              onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
            />
          )}
        />
      ) : (
        <Text style={styles.noFeatured}>{t('home.noFeatured')}</Text>
      )}

      {/* Why choose us */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.whyTitle')}</Text>
      </View>
      <View style={styles.reasons}>
        {REASONS.map((r, i) => (
          <View key={r.title} style={[styles.reason, i > 0 && styles.reasonDivider]}>
            <View style={[styles.reasonIcon, { backgroundColor: r.bg }]}>
              <Ionicons name={r.icon} size={22} color={r.tint} />
            </View>
            <View style={styles.reasonTexts}>
              <Text style={styles.reasonTitle}>{t(r.title)}</Text>
              <Text style={styles.reasonText}>{t(r.text)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>{t('home.ctaTitle')}</Text>
        <Text style={styles.ctaSubtitle}>{t('home.ctaSubtitle')}</Text>
        <View style={styles.ctaButtons}>
          <Button
            title={t('home.browseProperties')}
            icon="search"
            variant="secondary"
            onPress={() => navigation.navigate('Properties')}
          />
          <Button
            title={t('home.listProperty')}
            variant="inverse"
            onPress={() => navigation.navigate('Contact')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 16, gap: 16 },
  headerTexts: { flex: 1 },
  greeting: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  heroTitle: { fontSize: 28, lineHeight: 36, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: colors.textMuted },
  searchFilter: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  categories: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 22 },
  category: { alignItems: 'center', width: 72, gap: 8 },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  categoryLabel: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 28, marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.primary },
  carousel: { paddingHorizontal: 20, paddingBottom: 12 },
  loader: { marginVertical: 40 },
  noFeatured: { textAlign: 'center', color: colors.textSecondary, fontSize: 15, paddingVertical: 40 },
  reasons: { marginHorizontal: 20, backgroundColor: colors.surface, borderRadius: radius.lg, ...shadow.card },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  reasonDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  reasonIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  reasonTexts: { flex: 1 },
  reasonTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  reasonText: { fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginTop: 2 },
  cta: { margin: 20, marginTop: 28, padding: 24, borderRadius: radius.xl, backgroundColor: colors.primary },
  ctaTitle: { fontSize: 22, lineHeight: 30, fontWeight: '700', color: colors.white },
  ctaSubtitle: { fontSize: 14, lineHeight: 21, color: '#dbeafe', marginTop: 8, marginBottom: 20 },
  ctaButtons: { gap: 10 },
});
