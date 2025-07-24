import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    ViewStyle,
    StatusBar,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';

interface ScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
    scrollable?: boolean;
    safeArea?: boolean;
    statusBarStyle?: 'light' | 'dark';
    backgroundColor?: string;
    gradient?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    keyboardAvoiding?: boolean;
    padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Screen: React.FC<ScreenProps> = ({
    children,
    style,
    scrollable = false,
    safeArea = true,
    statusBarStyle = 'dark',
    backgroundColor = Colors.background,
    gradient = false,
    refreshing = false,
    onRefresh,
    keyboardAvoiding = false,
    padding = 'medium',
}) => {
    const getPaddingStyle = (): ViewStyle => {
        const paddings = {
            none: { padding: 0 },
            small: { padding: 12 },
            medium: { padding: 16 },
            large: { padding: 20 },
        };
        return paddings[padding];
    };

    const containerStyle: ViewStyle = {
        flex: 1,
        backgroundColor: gradient ? 'transparent' : backgroundColor,
        ...getPaddingStyle(),
    };

    const ContentWrapper = safeArea ? SafeAreaView : View;
    const ScrollWrapper = scrollable ? ScrollView : View;

    const renderContent = () => (
        <ContentWrapper style={[containerStyle, style]}>
            <StatusBar
                barStyle={statusBarStyle === 'light' ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundColor}
            />

            <ScrollWrapper
                style={scrollable ? { flex: 1 } : undefined}
                contentContainerStyle={scrollable ? { flexGrow: 1 } : undefined}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    ) : undefined
                }
            >
                {children}
            </ScrollWrapper>
        </ContentWrapper>
    );

    if (keyboardAvoiding) {
        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {gradient ? (
                    <LinearGradient
                        colors={Gradients.surface}
                        style={StyleSheet.absoluteFill}
                    >
                        {renderContent()}
                    </LinearGradient>
                ) : (
                    renderContent()
                )}
            </KeyboardAvoidingView>
        );
    }

    if (gradient) {
        return (
            <LinearGradient colors={Gradients.surface} style={StyleSheet.absoluteFill}>
                {renderContent()}
            </LinearGradient>
        );
    }

    return renderContent();
};
