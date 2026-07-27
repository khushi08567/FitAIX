// ─── ReusableButton — Apex Noir Palette ────────────────────────────────────────
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ReusableButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: '#FFD60A', text: '#12110D' }, // Apex Gold fill with Dark Text
  secondary: { bg: '#00F0FC', text: '#12110D' }, // Apex Electric Cyan fill with Dark Text
  outline: { bg: 'transparent', text: '#FFD60A', border: '#FFD60A' },
  ghost: { bg: 'rgba(255, 214, 10, 0.12)', text: '#FFD60A' },
  danger: { bg: '#FF6B6B', text: '#12110D' },
};

const SIZE_MAP = {
  sm: { height: 34, px: 12, fontSize: 12, iconSize: 14 },
  md: { height: 44, px: 18, fontSize: 14, iconSize: 16 },
  lg: { height: 52, px: 24, fontSize: 16, iconSize: 18 },
};

export const ReusableButton: React.FC<ReusableButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'md',
}) => {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_MAP[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
      style={[
        styles.button,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1.5 : 0,
          height: s.height,
          paddingHorizontal: s.px,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon as any}
              size={s.iconSize}
              color={v.text}
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.label, { color: v.text, fontSize: s.fontSize }, textStyle]}>
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon as any}
              size={s.iconSize}
              color={v.text}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconLeft: { marginRight: 6 },
  iconRight: { marginLeft: 6 },
});
