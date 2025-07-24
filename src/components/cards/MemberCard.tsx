import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Membre } from '../../services/groupeService';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

interface MemberCardProps {
    membre: Membre;
    onPress?: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ membre, onPress }) => {
    // 🔧 FONCTIONS UTILITAIRES SÉCURISÉES
    const safeString = (value: any, fallback: string = '') => {
        if (value === null || value === undefined) return fallback;
        return String(value);
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Date invalide';
            return date.toLocaleDateString('fr-FR');
        } catch {
            return 'Date invalide';
        }
    };

    const getRoleColor = (role: string) => {
        return role === 'CHEF' ? Colors.primary : Colors.textSecondary;
    };

    const getRoleIcon = (role: string): keyof typeof Ionicons.glyphMap => {
        return role === 'CHEF' ? 'star' : 'person';
    };

    const getStatutColor = (statut: string) => {
        return StyleUtils.getStatusColor(statut);
    };

    // 🔧 LOG POUR DEBUG
    console.log('👤 MemberCard data:', {
        id: membre.id,
        nom: safeString(membre.nom),
        prenom: safeString(membre.prenom),
        role: safeString(membre.role),
        statut: safeString(membre.statut)
    });

    const CardContent = (
        <View style={{
            backgroundColor: Colors.surface,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginHorizontal: Spacing.md,
            marginVertical: Spacing.xs,
            ...StyleUtils.getUniformShadow('low'),
        }}>
            {/* Avatar et info principale */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: Spacing.sm,
            }}>
                <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: Colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: Spacing.md,
                }}>
                    <Text style={{
                        ...Typography.caption,
                        color: Colors.surface,
                        fontWeight: '600',
                    }}>
                        {/* 🔧 SÉCURISATION: Gestion des initiales */}
                        {safeString(membre.nom).charAt(0).toUpperCase()}{safeString(membre.prenom).charAt(0).toUpperCase()}
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{
                        ...Typography.body,
                        color: Colors.textPrimary,
                        fontWeight: '600',
                    }}>
                        {/* 🔧 SÉCURISATION: Concatenation sécurisée */}
                        {safeString(membre.prenom)} {safeString(membre.nom)}
                    </Text>
                    {membre.poste && (
                        <Text style={{
                            ...Typography.caption,
                            color: Colors.textSecondary,
                        }} numberOfLines={1}>
                            {safeString(membre.poste, 'Poste non défini')}
                        </Text>
                    )}
                    <Text style={{
                        ...Typography.caption,
                        color: Colors.textMuted,
                    }} numberOfLines={1}>
                        {safeString(membre.email, 'Email non défini')}
                    </Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: Spacing.sm,
                        paddingVertical: Spacing.sm,
                        backgroundColor: StyleUtils.withOpacity(getRoleColor(safeString(membre.role)), 0.2),
                        borderRadius: BorderRadius.sm,
                    }}>
                        <Ionicons
                            name={getRoleIcon(safeString(membre.role))}
                            size={12}
                            color={getRoleColor(safeString(membre.role))}
                        />
                        <Text style={{
                            ...Typography.caption,
                            marginLeft: Spacing.xs,
                            color: getRoleColor(safeString(membre.role)),
                            fontWeight: '500',
                        }}>
                            {safeString(membre.role) === 'CHEF' ? 'Chef' : 'Membre'}
                        </Text>
                    </View>

                    <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: getStatutColor(safeString(membre.statut)),
                    }} />
                </View>
            </View>

            {/* Footer avec date */}
            <View style={{
                paddingTop: Spacing.sm,
                borderTopWidth: 1,
                borderTopColor: Colors.border,
            }}>
                <Text style={{
                    ...Typography.caption,
                    color: Colors.textMuted,
                    textAlign: 'center',
                }}>
                    Ajouté le {membre.dateAjout ? formatDate(membre.dateAjout) : 'Date inconnue'}
                </Text>
            </View>
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {CardContent}
            </TouchableOpacity>
        );
    }

    return CardContent;
};