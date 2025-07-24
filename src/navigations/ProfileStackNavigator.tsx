// src/navigations/stacks/ProfileStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import ChangePasswordScreen from '@/screens/profile/ChangePasswordScreen';


// Types
export type ProfileStackParamList = {
    ProfileHome: undefined;
    ChangePassword: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="ProfileHome"
                component={ProfileScreen}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
            />
        </Stack.Navigator>
    );
};