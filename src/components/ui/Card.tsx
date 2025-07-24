import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

interface CardProps {
    children: React.ReactNode;
    style?: any;
    onPress?: () => void;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    onPress,
    variant = 'default',
    padding = 'medium',
}) => {
    const getVariantStyle = () => {
        const variants = {
            default: {
                backgroundColor: Colors.surface,
                borderRadius: BorderRadius.lg,
                ...StyleUtils.getUniformShadow('low'),
            },
            elevated: {
                backgroundColor: Colors.surface,
                borderRadius: BorderRadius.lg,
                ...StyleUtils.getUniformShadow('medium'),
            },
            outlined: {
                backgroundColor: Colors.surface,
                borderRadius: BorderRadius.lg,
                borderWidth: 1,
                borderColor: Colors.border,
                ...StyleUtils.getUniformShadow('low'),
            },
        };
        return variants[variant];
    };

    const getPaddingStyle = () => {
        const paddings = {
            none: { padding: 0 },
            small: { padding: 12 },
            medium: { padding: 16 },
            large: { padding: 20 },
        };
        return paddings[padding];
    };

    const cardStyle = {
        ...getVariantStyle(),
        ...getPaddingStyle(),
    };

    if (onPress) {
        return (
            <TouchableOpacity
                style={[cardStyle, style]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View style={[cardStyle, style]}>
            {children}
        </View>
    );
};