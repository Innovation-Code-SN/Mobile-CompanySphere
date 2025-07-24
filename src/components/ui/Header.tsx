import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

interface HeaderProps {
    title: string;
    subtitle?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onLeftPress?: () => void;
    onRightPress?: () => void;
    style?: ViewStyle;
    transparent?: boolean;
    centered?: boolean;
    variant?: 'default' | 'gradient';
}

export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    leftIcon,
    rightIcon,
    onLeftPress,
    onRightPress,
    style,
    transparent = false,
    centered = false,
    variant = 'default',
}) => {
    const insets = useSafeAreaInsets();

    const headerStyle = [
        {
            paddingTop: insets.top + Spacing.md,
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.md,
            backgroundColor: transparent
                ? 'transparent'
                : variant === 'gradient'
                    ? Colors.primary
                    : Colors.surface,
            ...StyleUtils.getUniformShadow('low'),
        },
        style,
    ];

    const titleColor = variant === 'gradient' ? Colors.surface : Colors.textPrimary;

    return (
        <View style={headerStyle}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 44,
            }}>
                {/* Left side */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    minWidth: 44,
                }}>
                    {leftIcon && onLeftPress && (
                        <TouchableOpacity
                            style={{
                                minHeight: 44,
                                width: 44,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: BorderRadius.lg,
                                backgroundColor: variant === 'gradient'
                                    ? StyleUtils.withOpacity(Colors.surface, 0.2)
                                    : 'transparent',
                            }}
                            onPress={onLeftPress}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name={leftIcon} size={24} color={titleColor} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Center */}
                <View style={{
                    flex: 1,
                    alignItems: centered ? 'center' : 'flex-start',
                    marginHorizontal: Spacing.md,
                }}>
                    <Text style={{
                        ...Typography.h5,
                        color: titleColor,
                        textAlign: centered ? 'center' : 'left',
                    }} numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={{
                            ...Typography.bodySmall,
                            color: variant === 'gradient'
                                ? StyleUtils.withOpacity(Colors.surface, 0.8)
                                : Colors.textSecondary,
                            textAlign: centered ? 'center' : 'left',
                            marginTop: 2,
                        }} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                {/* Right side */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    minWidth: 44,
                    justifyContent: 'flex-end',
                }}>
                    {rightIcon && onRightPress && (
                        <TouchableOpacity
                            style={{
                                minHeight: 44,
                                width: 44,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: BorderRadius.lg,
                                backgroundColor: variant === 'gradient'
                                    ? StyleUtils.withOpacity(Colors.surface, 0.2)
                                    : 'transparent',
                            }}
                            onPress={onRightPress}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name={rightIcon} size={24} color={titleColor} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};