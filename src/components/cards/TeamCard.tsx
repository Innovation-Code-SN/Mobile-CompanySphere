import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Groupe } from '../../services/groupeService';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

interface TeamCardProps {
    groupe: Groupe;
    onPress: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ groupe, onPress }) => {
    const getStatutColor = (statut: string) => {
        return StyleUtils.getStatusColor(statut);
    };

    const getStatutIcon = (statut: string): keyof typeof Ionicons.glyphMap => {
        switch (statut) {
            case 'ACTIF':
                return 'checkmark-circle';
            case 'INACTIF':
                return 'close-circle';
            case 'SUSPENDU':
                return 'pause-circle';
            default:
                return 'help-circle';
        }
    };

    return (
        <TouchableOpacity
            style={{
                backgroundColor: Colors.surface,
                borderRadius: BorderRadius.lg,
                padding: Spacing.lg,
                marginHorizontal: Spacing.md,
                marginVertical: Spacing.md,
                overflow: 'hidden',
                ...StyleUtils.getUniformShadow('low'),
            }}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Barre de couleur */}
            <View style={{
                height: 4,
                backgroundColor: groupe.couleur || Colors.primary,
                marginBottom: Spacing.md,
            }} />

            {/* En-tête avec nom et statut */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: Spacing.sm,
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        ...Typography.h6,
                        color: Colors.textPrimary,
                        marginRight: Spacing.sm,
                    }} numberOfLines={1}>
                        {groupe.nom}
                    </Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.sm,
                    backgroundColor: StyleUtils.withOpacity(getStatutColor(groupe.statut), 0.2),
                    borderRadius: BorderRadius.sm,
                }}>
                    <Ionicons
                        name={getStatutIcon(groupe.statut)}
                        size={12}
                        color={getStatutColor(groupe.statut)}
                    />
                    <Text style={{
                        ...Typography.caption,
                        marginLeft: Spacing.xs,
                        color: getStatutColor(groupe.statut),
                        fontWeight: '500',
                    }}>
                        {groupe.statut}
                    </Text>
                </View>
            </View>

            {/* Description */}
            {groupe.description && (
                <Text style={{
                    ...Typography.body,
                    color: Colors.textSecondary,
                    lineHeight: 18,
                    marginBottom: Spacing.sm,
                }} numberOfLines={2}>
                    {groupe.description}
                </Text>
            )}

            {/* Statistiques */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: Spacing.sm,
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Ionicons name="people" size={16} color={Colors.primary} />
                    <Text style={{
                        ...Typography.caption,
                        color: Colors.textSecondary,
                        marginLeft: Spacing.xs,
                    }}>
                        {groupe.nombreMembres} membres
                    </Text>
                </View>

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Ionicons name="calendar" size={16} color={Colors.textMuted} />
                    <Text style={{
                        ...Typography.caption,
                        color: Colors.textSecondary,
                        marginLeft: Spacing.xs,
                    }}>
                        {groupe.dateCreation ? 
                            new Date(groupe.dateCreation).toLocaleDateString('fr-FR') :
                            groupe.createdAt ?
                                new Date(groupe.createdAt).toLocaleDateString('fr-FR') :
                                'Date inconnue'
                        }
                    </Text>
                </View>
            </View>

            {/* Responsable */}
            {groupe.responsableNom && (
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: Spacing.sm,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
                }}>
                    <Ionicons name="person" size={14} color={Colors.textMuted} />
                    <Text style={{
                        ...Typography.caption,
                        color: Colors.textMuted,
                        flex: 1,
                        marginLeft: Spacing.xs,
                    }}>
                        Responsable: {groupe.responsableNom}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};