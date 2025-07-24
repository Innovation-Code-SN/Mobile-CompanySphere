import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helper?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    variant?: 'default' | 'filled' | 'outlined';
    size?: 'small' | 'medium' | 'large';
    containerStyle?: ViewStyle;
    isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helper,
    leftIcon,
    rightIcon,
    onRightIconPress,
    variant = 'outlined',
    size = 'medium',
    containerStyle,
    isPassword = false,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const getSizeStyles = () => {
        const sizes = {
            small: { height: 40, fontSize: 14, paddingHorizontal: 12 },
            medium: { height: 48, fontSize: 16, paddingHorizontal: 16 },
            large: { height: 56, fontSize: 18, paddingHorizontal: 20 },
        };
        return sizes[size];
    };

    const getVariantStyles = () => {
        const variants = {
            default: {
                backgroundColor: Colors.surface,
                borderBottomWidth: 2,
                borderBottomColor: isFocused ? Colors.primary : Colors.border,
                borderRadius: 0,
            },
            filled: {
                backgroundColor: Colors.surfaceVariant,
                borderWidth: 0,
                borderRadius: 8,
            },
            outlined: {
                backgroundColor: Colors.surface,
                borderWidth: 1.5,
                borderColor: error ? Colors.error : isFocused ? Colors.primary : Colors.border,
                borderRadius: 12,
            },
        };
        return variants[variant];
    };

    const inputStyle = {
        ...getSizeStyles(),
        ...getVariantStyles(),
        color: Colors.textPrimary,
        paddingLeft: leftIcon ? 44 : getSizeStyles().paddingHorizontal,
        paddingRight: (rightIcon || isPassword) ? 44 : getSizeStyles().paddingHorizontal,
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, error && { color: Colors.error }]}>
                    {label}
                </Text>
            )}

            <View style={styles.inputContainer}>
                {leftIcon && (
                    <View style={styles.leftIcon}>
                        <Ionicons
                            name={leftIcon}
                            size={20}
                            color={isFocused ? Colors.primary : Colors.textMuted}
                        />
                    </View>
                )}

                <TextInput
                    {...props}
                    style={[inputStyle, style]}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    placeholderTextColor={Colors.textMuted}
                />

                {(rightIcon || isPassword) && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={isPassword ? () => setIsPasswordVisible(!isPasswordVisible) : onRightIconPress}
                    >
                        <Ionicons
                            name={
                                isPassword
                                    ? isPasswordVisible
                                        ? 'eye-off-outline'
                                        : 'eye-outline'
                                    : rightIcon!
                            }
                            size={20}
                            color={isFocused ? Colors.primary : Colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {(error || helper) && (
                <Text style={[styles.helperText, error && styles.errorText]}>
                    {error || helper}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // Button styles
    shadowSmall: {
        shadowColor: Colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    shadowMedium: {
        shadowColor: Colors.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },

    // Input styles
    container: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    inputContainer: {
        position: 'relative',
    },
    leftIcon: {
        position: 'absolute',
        left: 16,
        top: '50%',
        transform: [{ translateY: -10 }],
        zIndex: 1,
    },
    rightIcon: {
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: [{ translateY: -10 }],
        zIndex: 1,
    },
    helperText: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 4,
        marginLeft: 4,
    },
    errorText: {
        color: Colors.error,
    },
});
