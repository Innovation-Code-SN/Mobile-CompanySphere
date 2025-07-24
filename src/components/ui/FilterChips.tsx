import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterChipsProps {
    options: FilterOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
    options,
    selectedValue,
    onSelect
}) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                flexDirection: 'row',
                paddingHorizontal: Spacing.md,
                gap: 12,
            }}
        >
            {options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                    <TouchableOpacity
                        key={option.value}
                        style={{
                            paddingHorizontal: Spacing.md,
                            paddingVertical: Spacing.sm,
                            borderRadius: BorderRadius.md,
                            backgroundColor: isSelected ? Colors.primary : Colors.surface,
                            borderWidth: 1,
                            borderColor: isSelected ? Colors.primary : Colors.border,
                        }}
                        onPress={() => onSelect(option.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={{
                            ...Typography.caption,
                            color: isSelected ? Colors.surface : Colors.textSecondary,
                            fontWeight: '500',
                        }}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};