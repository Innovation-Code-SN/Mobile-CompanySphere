import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
    retryText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message,
    onRetry,
    retryText = 'Réessayer'
}) => {
    return (
        <View style={errorStyles.container}>
            <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
            <Text style={errorStyles.message}>{message}</Text>
            {onRetry && (
                <TouchableOpacity style={errorStyles.retryButton} onPress={onRetry}>
                    <Text style={errorStyles.retryText}>{retryText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const errorStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 40,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#1E88E5',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
