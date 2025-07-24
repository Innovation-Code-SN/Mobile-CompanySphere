import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme, useThemeColors } from '../../constants/theme';

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
    const colors = useThemeColors();

    const headerStyle = [
        Theme.Components.header,
        {
            paddingTop: insets.top + Theme.Spacing.md,
            backgroundColor: transparent
                ? 'transparent'
                : variant === 'gradient'
                    ? colors.primary
                    : colors.surface,
        },
        style,
    ];

    const titleColor = variant === 'gradient' ? colors.surface : colors.textPrimary;

    return (
        <View style={headerStyle}>
            <View style={Theme.Components.headerContent}>
                {/* Left side */}
                <View style={[Theme.Layout.flexRowCenter, { minWidth: 44 }]}>
                    {leftIcon && onLeftPress && (
                        <TouchableOpacity
                            style={[Theme.Components.buttonBase, {
                                minHeight: 44,
                                width: 44,
                                paddingHorizontal: Theme.Spacing.md
                            }]}
                            onPress={onLeftPress}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name={leftIcon} size={24} color={titleColor} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Center */}
                <View style={[
                    Theme.Layout.flex,
                    centered ? Theme.Layout.flexColumnCenter : { alignItems: 'flex-start' },
                    Theme.SpacingStyles.mxmd
                ]}>
                    <Text style={[
                        Theme.Typography.h5,
                        { color: titleColor, textAlign: centered ? 'center' : 'left' }
                    ]} numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[
                            Theme.Typography.bodySmall,
                            { color: variant === 'gradient' ? colors.primaryLight : colors.textSecondary, textAlign: centered ? 'center' : 'left' }
                        ]} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                {/* Right side */}
                <View style={[Theme.Layout.flexRowCenter, { minWidth: 44, justifyContent: 'flex-end' }]}>
                    {rightIcon && onRightPress && (
                        <TouchableOpacity
                            style={[Theme.Components.buttonBase, {
                                minHeight: 44,
                                width: 44,
                                paddingHorizontal: Theme.Spacing.md
                            }]}
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