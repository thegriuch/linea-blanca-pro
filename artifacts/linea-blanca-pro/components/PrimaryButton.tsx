import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

interface Props {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md';
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'md',
}: Props) {
  const c = useColors();
  const radius = colors.radius;

  const bg =
    variant === 'primary' ? c.primary
    : variant === 'danger' ? c.destructive
    : variant === 'success' ? c.success
    : 'transparent';

  const textColor =
    variant === 'primary' ? c.primaryForeground
    : variant === 'danger' ? c.destructiveForeground
    : variant === 'success' ? c.successForeground
    : variant === 'outline' ? c.primary
    : c.foreground;

  const borderColor =
    variant === 'outline' ? c.primary
    : variant === 'ghost' ? 'transparent'
    : 'transparent';

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: radius,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor,
          opacity: disabled ? 0.5 : 1,
          paddingVertical: size === 'sm' ? 10 : 14,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && <Feather name={icon} size={size === 'sm' ? 15 : 18} color={textColor} style={styles.icon} />}
          <Text style={[styles.label, { color: textColor, fontSize: size === 'sm' ? 13 : 15 }]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 48,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 7,
  },
  label: {
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_600SemiBold', web: 'Inter_600SemiBold' }),
  },
});
