import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Typography';
import { colors, radius, shadow } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Inset-grouped card, like iOS Settings. Pass `ListRow`s (or any views) as children. */
export function ListGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.groupWrap}>
      {title ? <Text style={styles.groupTitle}>{title.toUpperCase()}</Text> : null}
      <View style={styles.group}>
        {items.map((child, i) => (
          <View key={i}>
            {child}
            {i < items.length - 1 ? <View style={styles.separator} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

type RowProps = {
  label: string;
  icon: IconName;
  tint?: string;
  tintBg?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
};

export function ListRow({ label, icon, tint = colors.primary, tintBg = colors.primarySoft, onPress, right, destructive }: RowProps) {
  const content = (
    <View style={styles.row}>
      <View style={[styles.iconTile, { backgroundColor: destructive ? colors.dangerSoft : tintBg }]}>
        <Ionicons name={icon} size={18} color={destructive ? colors.danger : tint} />
      </View>
      <Text style={[styles.label, destructive && { color: colors.danger }]}>{label}</Text>
      {right}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  groupWrap: { marginTop: 20, paddingHorizontal: 16 },
  groupTitle: { fontSize: 12, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.6, marginBottom: 8, marginLeft: 16 },
  group: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 62 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 16, paddingVertical: 10 },
  iconTile: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
  pressed: { backgroundColor: colors.bg },
});
