// ─── Header Component — Apex Noir Theme ────────────────────────────────────────
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface HeaderProps {
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNotificationPress,
  onSearchPress,
  notificationCount = 3,
}) => {
  return (
    <View style={styles.container}>
      {/* Left: Avatar + greeting */}
      <View style={styles.left}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
            style={styles.avatar}
          />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Good evening 👋</Text>
          <Text style={styles.name}>Alex Johnson</Text>
        </View>
      </View>

      {/* Right: Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}
          accessibilityLabel="Search foods"
        >
          <MaterialCommunityIcons name="magnify" size={22} color="#A6A090" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          accessibilityLabel="Notifications"
        >
          <MaterialCommunityIcons name="bell-outline" size={22} color="#A6A090" />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Title Row (screen section header) ───────────────────────────────────────
interface SectionTitleProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
  iconColor?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
  iconColor = '#FFD60A',
}) => (
  <View style={styles.sectionRow}>
    <View style={styles.sectionLeft}>
      {icon && (
        <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} style={styles.sectionIcon} />
      )}
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFD60A',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#00F0FC',
    borderWidth: 2,
    borderColor: '#12110D',
  },
  greetingBlock: {
    gap: 1,
  },
  greeting: {
    fontSize: 12,
    color: '#A6A090',
    fontWeight: '400',
  },
  name: {
    fontSize: 16,
    color: '#F2EFE9',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#1C1A14',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 10, 0.18)',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#12110D',
  },
  badgeText: {
    fontSize: 8,
    color: '#12110D',
    fontWeight: '800',
  },
  // Section title
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    marginRight: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F2EFE9',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#A6A090',
    marginTop: 1,
  },
  actionLabel: {
    fontSize: 13,
    color: '#FFD60A',
    fontWeight: '600',
  },
});
