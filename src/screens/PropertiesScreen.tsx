import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text, TextInput } from '../components/Typography';
import ScreenHeader from '../components/ScreenHeader';
import PropertyCard from '../components/PropertyCard';
import Chip from '../components/Chip';
import Button from '../components/Button';
import { propertyApi } from '../services/api';
import { Property, Filters } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { RootStackParamList, MainTabParamList } from '../navigation/AppNavigator';
import { colors, radius, shadow } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Properties'>,
  NativeStackScreenProps<RootStackParamList>
>;

type SheetFilters = {
  type: string;
  listingType: string;
  minBedrooms: string;
  features: string[];
};

const EMPTY_FILTERS: SheetFilters = { type: '', listingType: '', minBedrooms: '', features: [] };
const SORT_OPTIONS = ['newest', 'price_low', 'price_high', 'bedrooms'];
const TYPES = ['', 'house', 'apartment', 'office', 'land'];
const LISTING_TYPES = ['', 'sale', 'rent'];
const BEDROOMS = ['', '1', '2', '3', '4', '5'];
const FEATURES = ['pool', 'garden', 'garage', 'airConditioning', 'balcony', 'securitySystem', 'fireplace', 'gym', 'elevator', 'parking'];

export default function PropertiesScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [applied, setApplied] = useState<SheetFilters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<SheetFilters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const requestId = useRef(0);

  // Category shortcuts on Home open this tab with a property type preselected.
  const routeType = route.params?.type;
  useEffect(() => {
    if (routeType !== undefined) {
      setApplied((prev) => ({ ...prev, type: routeType }));
    }
  }, [route.params, routeType]);

  // Search as you type, without hammering the API.
  useEffect(() => {
    const handle = setTimeout(() => setKeyword(searchText.trim()), 400);
    return () => clearTimeout(handle);
  }, [searchText]);

  const loadProperties = useCallback(async () => {
    const id = ++requestId.current;
    const filters: Filters = { sort: sortBy };
    if (keyword) filters.keyword = keyword;
    if (applied.type) filters.type = applied.type;
    if (applied.listingType) filters.listing_type = applied.listingType;
    if (applied.minBedrooms) filters.min_bedrooms = parseInt(applied.minBedrooms, 10);
    if (applied.features.length > 0) filters.features = applied.features;

    try {
      const response = await propertyApi.searchProperties(filters);
      // Ignore answers to requests that have since been superseded.
      if (id === requestId.current && response.records) {
        setProperties(response.records);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [keyword, sortBy, applied]);

  useEffect(() => {
    setLoading(true);
    loadProperties();
  }, [loadProperties]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  const activeCount =
    (applied.type ? 1 : 0) + (applied.listingType ? 1 : 0) + (applied.minBedrooms ? 1 : 0) + (applied.features.length ? 1 : 0);

  const openSheet = () => {
    setDraft(applied);
    setSheetOpen(true);
  };

  const applySheet = () => {
    setApplied(draft);
    setSheetOpen(false);
  };

  const toggleFeature = (feature: string) =>
    setDraft((d) => ({
      ...d,
      features: d.features.includes(feature) ? d.features.filter((f) => f !== feature) : [...d.features, feature],
    }));

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('nav.properties')} />

      {/* Search + filter button */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('properties.searchPlaceholder')}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={() => setKeyword(searchText.trim())}
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <Pressable hitSlop={12} accessibilityRole="button" accessibilityLabel={t('common.clear')} onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('properties.filters')}
          onPress={openSheet}
          style={({ pressed }) => [styles.filterButton, pressed && { backgroundColor: colors.primaryPressed }]}
        >
          <Ionicons name="options-outline" size={22} color={colors.white} />
          {activeCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
              {SORT_OPTIONS.map((option) => (
                <Chip key={option} label={t(`properties.sort.${option}`)} active={sortBy === option} onPress={() => setSortBy(option)} />
              ))}
            </ScrollView>
            {!loading && <Text style={styles.resultsCount}>{t('properties.resultsFound', { count: properties.length })}</Text>}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>{t('properties.noResultsTitle')}</Text>
              <Text style={styles.emptyText}>{t('properties.noResultsText')}</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <PropertyCard property={item} onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })} />
        )}
      />

      {/* Filters bottom sheet */}
      <Modal visible={sheetOpen} transparent animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={() => setSheetOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)} accessibilityLabel={t('common.clear')} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.grabber} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('properties.filters')}</Text>
              <Pressable hitSlop={10} accessibilityRole="button" onPress={() => setDraft(EMPTY_FILTERS)}>
                <Text style={styles.reset}>{t('properties.reset')}</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
              <FilterGroup label={t('properties.propertyType')}>
                {TYPES.map((type) => (
                  <Chip
                    key={type || 'all'}
                    label={type === '' ? t('common.all') : t(`properties.types.${type}`)}
                    active={draft.type === type}
                    onPress={() => setDraft((d) => ({ ...d, type }))}
                  />
                ))}
              </FilterGroup>

              <FilterGroup label={t('properties.listingType')}>
                {LISTING_TYPES.map((type) => (
                  <Chip
                    key={type || 'all'}
                    label={type === '' ? t('common.all') : t(`properties.listing.${type}`)}
                    active={draft.listingType === type}
                    onPress={() => setDraft((d) => ({ ...d, listingType: type }))}
                  />
                ))}
              </FilterGroup>

              <FilterGroup label={t('properties.minBedrooms')}>
                {BEDROOMS.map((beds) => (
                  <Chip
                    key={beds || 'any'}
                    label={beds === '' ? t('common.any') : `${beds}+`}
                    active={draft.minBedrooms === beds}
                    onPress={() => setDraft((d) => ({ ...d, minBedrooms: beds }))}
                  />
                ))}
              </FilterGroup>

              <FilterGroup label={t('properties.features')}>
                {FEATURES.map((feature) => (
                  <Chip
                    key={feature}
                    label={t(`properties.featureNames.${feature}`)}
                    active={draft.features.includes(feature)}
                    onPress={() => toggleFeature(feature)}
                  />
                ))}
              </FilterGroup>
            </ScrollView>

            <Button title={t('properties.applyFilters')} onPress={applySheet} style={styles.applyButton} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
  filterButton: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: colors.white, fontSize: 10, lineHeight: 14, fontWeight: '700' },
  sortRow: { gap: 8, paddingVertical: 8 },
  resultsCount: { fontSize: 13, color: colors.textSecondary, marginTop: 6, marginBottom: 14, marginLeft: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  loader: { marginVertical: 60 },
  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 24 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrim },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  reset: { fontSize: 15, fontWeight: '600', color: colors.primary },
  sheetBody: { paddingTop: 8, paddingBottom: 8 },
  filterGroup: { marginBottom: 20 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 10 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  applyButton: { marginTop: 8 },
});
