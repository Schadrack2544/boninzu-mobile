import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from './Typography';
import PressableScale from './PressableScale';
import { Property } from '../types';
import { colors, radius, shadow } from '../theme';

type Props = {
  property: Property;
  onPress: () => void;
  /** Fixed width for horizontal carousels; omit to fill the parent. */
  width?: number;
};

export default function PropertyCard({ property, onPress, width }: Props) {
  const { t } = useTranslation();
  const isRent = property.listing_type === 'rent';
  const price = t(isRent ? 'property.pricePerMonth' : 'property.price', { price: Number(property.price).toLocaleString() });

  return (
    <PressableScale accessibilityRole="button" onPress={onPress} style={[styles.card, width ? { width } : null]}>
      <View style={styles.imageWrap}>
        {property.primary_image ? (
          <Image source={{ uri: property.primary_image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="home-outline" size={40} color={colors.textMuted} />
          </View>
        )}
        <View style={[styles.badge, isRent ? styles.badgeRent : styles.badgeSale]}>
          <Text style={styles.badgeText}>{t(`properties.listing.${isRent ? 'rent' : 'sale'}`)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {property.location}
          </Text>
        </View>
        <View style={styles.metaRow}>
          {property.bedrooms ? <Meta icon="bed-outline" text={String(property.bedrooms)} /> : null}
          {property.bathrooms ? <Meta icon="water-outline" text={String(property.bathrooms)} /> : null}
          <Meta icon="resize-outline" text={`${property.area} m²`} />
        </View>
      </View>
    </PressableScale>
  );
}

function Meta({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, ...shadow.card },
  imageWrap: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, overflow: 'hidden' },
  image: { width: '100%', height: 190, backgroundColor: colors.separator },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  badgeSale: { backgroundColor: colors.primary },
  badgeRent: { backgroundColor: colors.violet },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '600' },
  body: { padding: 14, gap: 3 },
  price: { fontSize: 19, lineHeight: 28, fontWeight: '700', color: colors.primary },
  title: { fontSize: 15, lineHeight: 22, fontWeight: '600', color: colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { flex: 1, fontSize: 13, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
});
