import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '../components/Typography';
import Button from '../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { propertyApi } from '../services/api';
import { PropertyDetails } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, radius, shadow } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PropertyDetails'>;
  route: RouteProp<RootStackParamList, 'PropertyDetails'>;
};

const GALLERY_HEIGHT = 340;

export default function PropertyDetailsScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Local-only for now: there is no "saved properties" API yet.
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadPropertyDetails = async () => {
      try {
        const response = await propertyApi.getPropertyDetails(route.params.propertyId);
        if (response.property) {
          setProperty({
            ...response.property,
            images: response.images ?? [],
            features: response.features ?? [],
          } as PropertyDetails);
        }
      } catch (error) {
        console.error('Error loading property details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPropertyDetails();
  }, [route.params.propertyId]);

  const BackButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('details.goBack')}
      hitSlop={8}
      onPress={() => navigation.goBack()}
      style={[styles.floatingButton, { top: insets.top + 8, left: 16 }]}
    >
      <Ionicons name="chevron-back" size={24} color={colors.text} />
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        {BackButton}
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerText}>{t('details.loading')}</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        {BackButton}
        <View style={styles.emptyIcon}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.primary} />
        </View>
        <Text style={styles.errorText}>{t('details.notFound')}</Text>
        <Button title={t('details.goBack')} onPress={() => navigation.goBack()} style={{ alignSelf: 'stretch', marginHorizontal: 32 }} />
      </View>
    );
  }

  const images = property.images?.length
    ? property.images
    : property.primary_image
      ? [{ image_url: property.primary_image, is_primary: true, display_order: 0 }]
      : [];
  const isRent = property.listing_type === 'rent';
  const price = t(isRent ? 'property.pricePerMonth' : 'property.price', { price: Number(property.price).toLocaleString() });

  const onGalleryScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCurrentImageIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const contactAgent = () => {
    if (property.agent_email) {
      Linking.openURL(`mailto:${property.agent_email}?subject=${encodeURIComponent(property.title)}`).catch(() => {});
    } else {
      navigation.navigate('Main', { screen: 'Contact' } as never);
    }
  };

  const stats: { icon: React.ComponentProps<typeof Ionicons>['name']; value: string; label: string }[] = [];
  if (property.bedrooms) stats.push({ icon: 'bed-outline', value: String(property.bedrooms), label: t('property.bedrooms') });
  if (property.bathrooms) stats.push({ icon: 'water-outline', value: String(property.bathrooms), label: t('property.bathrooms') });
  stats.push({ icon: 'resize-outline', value: Number(property.area).toLocaleString(), label: t('property.sqMeters') });
  if (property.year_built) {
    stats.push({ icon: 'calendar-outline', value: String(property.year_built), label: t('property.yearBuilt') });
  }

  return (
    <View style={styles.container}>
      {/* The gallery runs under the status bar, so use light icons here. */}
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 + insets.bottom }} bounces>
        {/* Gallery */}
        <View style={{ height: GALLERY_HEIGHT }}>
          {images.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onGalleryScrollEnd}>
              {images.map((image, index) => (
                <Image key={index} source={{ uri: image.image_url }} style={{ width, height: GALLERY_HEIGHT, backgroundColor: colors.separator }} resizeMode="cover" />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.noImage, { width, height: GALLERY_HEIGHT }]}>
              <Ionicons name="home-outline" size={56} color={colors.textMuted} />
            </View>
          )}
          {/* Soft scrim so the status bar icons and back button stay readable on bright photos. */}
          {images.length > 0 && (
            <>
              <View pointerEvents="none" style={[styles.topScrim, { height: insets.top + 72 }]} />
              <View pointerEvents="none" style={[styles.topScrim, { height: insets.top + 28 }]} />
            </>
          )}
          {images.length > 1 && (
            <View style={styles.counter}>
              <Ionicons name="images-outline" size={14} color={colors.white} />
              <Text style={styles.counterText}>
                {currentImageIndex + 1}/{images.length}
              </Text>
            </View>
          )}
        </View>

        {/* Content sheet that overlaps the gallery */}
        <View style={styles.sheet}>
          <View style={[styles.badge, isRent ? styles.badgeRent : styles.badgeSale]}>
            <Text style={styles.badgeText}>{t(`properties.listing.${isRent ? 'rent' : 'sale'}`)}</Text>
          </View>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.location}>{property.location}</Text>
          </View>

          <View style={styles.stats}>
            {stats.map((s, i) => (
              <View key={s.label} style={[styles.stat, i > 0 && styles.statDivider]}>
                <Ionicons name={s.icon} size={22} color={colors.primary} />
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  {s.value}
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('details.description')}</Text>
          <Text style={styles.description}>{property.description}</Text>

          {property.features && property.features.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{t('details.featuresAmenities')}</Text>
              <View style={styles.featuresWrap}>
                {property.features.map((feature, index) => (
                  <View key={index} style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                    <Text style={styles.featureText}>{feature.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {property.agent_name && (
            <>
              <Text style={styles.sectionTitle}>{t('details.listedBy')}</Text>
              <Pressable accessibilityRole="button" onPress={contactAgent} style={({ pressed }) => [styles.agent, pressed && { backgroundColor: colors.bg }]}>
                <View style={styles.agentAvatar}>
                  <Text style={styles.agentAvatarText}>{property.agent_name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.agentInfo}>
                  <Text style={styles.agentName}>{property.agent_name}</Text>
                  {property.agent_email ? <Text style={styles.agentEmail}>{property.agent_email}</Text> : null}
                </View>
                <View style={styles.agentAction}>
                  <Ionicons name="mail-outline" size={20} color={colors.primary} />
                </View>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      {BackButton}

      {/* Sticky action bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? t('details.saved') : t('details.save')}
          accessibilityState={{ selected: saved }}
          onPress={() => setSaved((s) => !s)}
          style={[styles.saveButton, saved && styles.saveButtonActive]}
        >
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={24} color={saved ? colors.danger : colors.textSecondary} />
        </Pressable>
        <Button title={t('details.contactAgent')} icon="mail" onPress={contactAgent} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.bg },
  centerText: { fontSize: 15, color: colors.textSecondary },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 8 },
  floatingButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  noImage: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.separator },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.12)' },
  counter: {
    position: 'absolute',
    bottom: 40,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  counterText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  sheet: {
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, marginBottom: 10 },
  badgeSale: { backgroundColor: colors.primary },
  badgeRent: { backgroundColor: colors.violet },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  price: { fontSize: 28, lineHeight: 38, fontWeight: '700', color: colors.primary, letterSpacing: -0.5 },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '700', color: colors.text, marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  location: { flex: 1, fontSize: 14, color: colors.textSecondary },
  stats: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: 16, marginTop: 20, ...shadow.card },
  stat: { flex: 1, alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  statDivider: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border },
  statValue: { fontSize: 17, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 28, marginBottom: 10, letterSpacing: -0.2 },
  description: { fontSize: 15, lineHeight: 24, color: colors.textSecondary },
  featuresWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  featureText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  agent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, ...shadow.card },
  agentAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  agentAvatarText: { fontSize: 20, fontWeight: '700', color: colors.white },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 15, fontWeight: '600', color: colors.text },
  agentEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  agentAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  saveButton: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  saveButtonActive: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
});
