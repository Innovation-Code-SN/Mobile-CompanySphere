import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Typography, Components, Shadows } from '../../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: any;
    textStyle?: any;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    icon,
    iconPosition = 'left',
}) => {
    const getButtonStyle = () => {
        const baseStyle = {
            ...Components.buttonBase,
            flexDirection: icon ? 'row' : 'column',
        };

        // Size styles
        const sizeStyles = {
            small: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
            medium: { paddingVertical: 12, paddingHorizontal: 20, minHeight: 44 },
            large: { paddingVertical: 16, paddingHorizontal: 24, minHeight: 52 },
        };

        // Variant styles
        const variantStyles = {
            primary: Components.buttonPrimary,
            secondary: Components.buttonSecondary,
            outline: Components.buttonOutline,
            ghost: Components.buttonGhost,
            gradient: Shadows.small,
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
            opacity: disabled ? 0.6 : 1,
            width: fullWidth ? '100%' : 'auto',
        };
    };

    const getTextStyle = () => {
        const sizeStyles = {
            small: { ...Typography.buttonSmall },
            medium: { ...Typography.button },
            large: { ...Typography.button, fontSize: 18, fontWeight: '700' },
        };

        const variantStyles = {
            primary: { color: Colors.surface },
            secondary: { color: Colors.surface },
            outline: { color: Colors.primary },
            ghost: { color: Colors.primary },
            gradient: { color: Colors.surface },
        };

        return {
            ...sizeStyles[size],
            ...variantStyles[variant],
        };
    };

    const renderContent = () => (
        <>
            {icon && iconPosition === 'left' && <>{icon}</>}
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.surface}
                    style={icon ? { marginHorizontal: 8 } : undefined}
                />
            ) : (
                <Text style={[getTextStyle(), textStyle, icon && { marginHorizontal: 8 }]}>
                    {title}
                </Text>
            )}
            {icon && iconPosition === 'right' && <>{icon}</>}
        </>
    );

    if (variant === 'gradient') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[getButtonStyle(), style]}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={Gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12 }}
                />
                {renderContent()}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[getButtonStyle(), style]}
            activeOpacity={0.8}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};
