import React from 'react';
import { View, Text, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    actionLabel?: string;
    onActionPress?: () => void;
    style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'folder-open-outline',
    title,
    description,
    actionLabel,
    onActionPress,
    style,
}) => {
    return (
        <View style={[
            {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: Spacing.xl,
            },
            style
        ]}>
            <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: Colors.surfaceVariant,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Spacing.xl,
            }}>
                <Ionicons name={icon} size={64} color={Colors.textMuted} />
            </View>

            <Text style={{
                ...Typography.h4,
                color: Colors.textPrimary,
                textAlign: 'center',
                marginBottom: Spacing.md,
            }}>
                {title}
            </Text>

            {description && (
                <Text style={{
                    ...Typography.body,
                    color: Colors.textMuted,
                    textAlign: 'center',
                    lineHeight: 22,
                    marginBottom: Spacing.xl,
                }}>
                    {description}
                </Text>
            )}

            {actionLabel && onActionPress && (
                <TouchableOpacity
                    style={{
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: Colors.primary,
                        borderRadius: BorderRadius.lg,
                        paddingVertical: Spacing.md,
                        paddingHorizontal: Spacing.xl,
                        marginTop: Spacing.lg,
                    }}
                    onPress={onActionPress}
                    activeOpacity={0.7}
                >
                    <Text style={{
                        ...Typography.button,
                        color: Colors.primary,
                        textAlign: 'center',
                    }}>
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};