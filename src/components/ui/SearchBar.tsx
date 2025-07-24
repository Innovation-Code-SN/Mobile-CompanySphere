import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ViewStyle,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    onSearch?: (text: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    style?: ViewStyle;
    autoFocus?: boolean;
    showCancel?: boolean;
    onCancel?: () => void;
    variant?: 'outlined' | 'filled';
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Rechercher...',
    value,
    onChangeText,
    onSearch,
    onFocus,
    onBlur,
    style,
    autoFocus = false,
    showCancel = false,
    onCancel,
    variant = 'outlined',
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
        onFocus?.();
    };

    const handleBlur = () => {
        setIsFocused(false);
        onBlur?.();
    };

    const handleClear = () => {
        onChangeText('');
        onSearch?.('');
    };

    const handleCancel = () => {
        onChangeText('');
        setIsFocused(false);
        onCancel?.();
    };

    const getInputContainerStyle = () => {
        const baseStyle = {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            borderRadius: BorderRadius.lg,
            backgroundColor: variant === 'filled' ? Colors.surfaceVariant : Colors.surface,
            borderWidth: variant === 'outlined' ? 1 : 0,
            borderColor: isFocused ? Colors.primary : Colors.border,
            ...StyleUtils.getUniformShadow('low'),
        };

        return baseStyle;
    };

    return (
        <View style={[{ flexDirection: 'row' }, style]}>
            <Animated.View
                style={[
                    getInputContainerStyle(),
                    {
                        flex: 1,
                        borderColor: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [Colors.border, Colors.primary],
                        }),
                    },
                ]}
            >
                <Ionicons
                    name="search-outline"
                    size={20}
                    color={isFocused ? Colors.primary : Colors.textMuted}
                    style={{ marginRight: Spacing.md }}
                />

                <TextInput
                    style={{
                        flex: 1,
                        ...Typography.body,
                        color: Colors.textPrimary,
                    }}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onSubmitEditing={() => onSearch?.(value)}
                    autoFocus={autoFocus}
                    returnKeyType="search"
                />

                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClear}
                        style={{ marginLeft: Spacing.md }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color={Colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>

            {showCancel && isFocused && (
                <Animated.View
                    style={{
                        marginLeft: Spacing.md,
                        opacity: fadeAnim,
                        transform: [
                            {
                                translateX: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0],
                                }),
                            },
                        ],
                    }}
                >
                    <TouchableOpacity
                        onPress={handleCancel}
                        style={{
                            paddingHorizontal: Spacing.md,
                            paddingVertical: Spacing.md,
                        }}
                    >
                        <Text style={{
                            ...Typography.button,
                            color: Colors.primary,
                        }}>
                            Annuler
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};