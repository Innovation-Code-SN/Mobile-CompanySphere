// src/screens/teams/TeamDetailScreen.tsx - VERSION UNIFORME
import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Text,
    RefreshControl,
    TouchableOpacity,
    Linking,
    Alert,
    Modal,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';
import { StyleSheet } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../store';
import {
    fetchTeamById,
    selectCurrentTeam,
    selectTeamsLoading,
    selectTeamsError,
    clearTeamsError
} from '../../store/slices/teamsSlice';

import { EmptyState } from '@/components/ui/EmptyState';
import { TeamDetailScreenProps } from '../../navigations/types';

interface ContactItemProps {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    actionIcon?: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, label, value, onPress, actionIcon }) => (
    <TouchableOpacity
        style={[styles.contactItem, !value && styles.contactItemDisabled]}
        onPress={value ? onPress : undefined}
        disabled={!value}
        activeOpacity={0.7}
    >
        <View style={styles.contactLeft}>
            <View style={styles.contactIcon}>
                <Ionicons name={icon as any} size={20} color={value ? Colors.secondary : Colors.textMuted} />
            </View>
            <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>{label}</Text>
                <Text style={[styles.contactValue, !value && styles.contactValueDisabled]}>
                    {value || 'Non renseigné'}
                </Text>
            </View>
        </View>
        {value && actionIcon && (
            <Ionicons name={actionIcon as any} size={20} color={Colors.secondary} />
        )}
    </TouchableOpacity>
);

interface QuickActionButtonProps {
    icon: string;
    label: string;
    onPress: () => void;
    color: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, onPress, color }) => (
    <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: `${color}15` }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
);

export const TeamDetailScreen: React.FC<TeamDetailScreenProps> = ({ navigation, route }) => {
    const dispatch = useAppDispatch();
    const { teamId, teamName } = route.params;

    const team = useAppSelector(selectCurrentTeam);
    const isLoading = useAppSelector(selectTeamsLoading);
    const error = useAppSelector(selectTeamsError);

    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        console.log('🔍 TeamDetailScreen mounted with params:', { teamId, teamName });
        loadTeamDetail();
    }, [teamId]);

    useEffect(() => {
        if (team?.nom) {
            navigation.setOptions({
                title: team.nom,
                headerStyle: {
                    backgroundColor: Colors.secondary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            });
        } else if (teamName) {
            navigation.setOptions({
                title: teamName,
                headerStyle: {
                    backgroundColor: Colors.secondary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            });
        }
    }, [team, teamName, navigation]);

    const loadTeamDetail = () => {
        console.log('📡 Loading team details for ID:', teamId);
        dispatch(fetchTeamById(teamId));
    };

    const onRefresh = () => {
        dispatch(fetchTeamById(teamId));
    };

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

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Date invalide';
            }
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Erreur formatage date:', error);
            return 'Date invalide';
        }
    };

    const safeDisplay = (value: any, fallback: string = 'Non défini') => {
        if (value === null || value === undefined) {
            return fallback;
        }
        if (typeof value === 'object') {
            if (value.nom) return value.nom;
            if (value.name) return value.name;
            if (value.title) return value.title;
            return JSON.stringify(value);
        }
        return String(value);
    };

    const handleContactResponsable = async () => {
        const responsableEmail = team?.responsable?.contact?.email || team?.responsableEmail;

        if (!responsableEmail) {
            Alert.alert('Information', 'Aucun email disponible pour le responsable');
            return;
        }

        const url = `mailto:${responsableEmail}`;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application mail');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Erreur lors de l\'ouverture de l\'email');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return renderInfoTab();
            case 'contact':
                return renderContactTab();
            case 'members':
                return renderMembersTab();
            default:
                return renderInfoTab();
        }
    };

    const renderInfoTab = () => {
        // Utilisation du service corrigé avec les nouvelles interfaces
        const nombreMembres = team?.membres?.length || team?.nombreMembres || 0;

        return (
            <View style={styles.tabContent}>
                {/* Informations générales */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations générales</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="people-outline" size={20} color={Colors.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Nom de l'équipe</Text>
                                <Text style={styles.infoValue}>
                                    {safeDisplay(team?.nom, 'Équipe sans nom')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="flag-outline" size={20} color={Colors.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Statut</Text>
                                <Text style={[styles.infoValue, { color: getStatutColor(team?.statut || '') }]}>
                                    {safeDisplay(team?.statut, 'Statut inconnu')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="calendar-outline" size={20} color={Colors.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Date de création</Text>
                                <Text style={styles.infoValue}>
                                    {team?.dateCreation ? formatDate(team.dateCreation) :
                                        team?.createdAt ? formatDate(team.createdAt) : 'Non définie'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="people" size={20} color={Colors.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Nombre de membres</Text>
                                <Text style={styles.infoValue}>
                                    {nombreMembres} membre{nombreMembres > 1 ? 's' : ''}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Description */}
                {team?.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <View style={styles.descriptionCard}>
                            <Text style={styles.descriptionText}>
                                {safeDisplay(team.description, 'Aucune description')}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const renderContactTab = () => (
        <View style={styles.tabContent}>
            {(team?.responsable || team?.responsableNom) ? (
                <>
                    {/* Responsable */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Responsable de l'équipe</Text>
                        <View style={styles.responsableCard}>
                            <View style={styles.responsableHeader}>
                                <View style={styles.responsableAvatar}>
                                    <Ionicons name="person" size={32} color={Colors.secondary} />
                                </View>
                                <View style={styles.responsableInfo}>
                                    <Text style={styles.responsableName}>
                                        {team?.responsable ?
                                            `${team.responsable.prenom} ${team.responsable.nom}` :
                                            safeDisplay(team?.responsableNom, 'Nom non défini')
                                        }
                                    </Text>
                                    {team?.responsable?.poste?.nom && (
                                        <Text style={styles.responsableTitle}>
                                            {team.responsable.poste.nom}
                                        </Text>
                                    )}
                                    {(team?.responsable?.contact?.email || team?.responsableEmail) && (
                                        <Text style={styles.responsableEmail}>
                                            {team?.responsable?.contact?.email || team?.responsableEmail}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Contact du responsable */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact du responsable</Text>
                        <View style={styles.contactList}>
                            <ContactItem
                                icon="mail-outline"
                                label="Email professionnel"
                                value={team?.responsable?.contact?.email || team?.responsableEmail}
                                onPress={handleContactResponsable}
                                actionIcon="send-outline"
                            />
                            <ContactItem
                                icon="call-outline"
                                label="Téléphone interne"
                                value={team?.responsable?.contact?.telephoneInterne}
                                onPress={() => {
                                    if (team?.responsable?.contact?.telephoneInterne) {
                                        Linking.openURL(`tel:${team.responsable.contact.telephoneInterne}`);
                                    }
                                }}
                                actionIcon="call"
                            />
                            <ContactItem
                                icon="phone-portrait-outline"
                                label="Téléphone mobile"
                                value={team?.responsable?.contact?.telephoneMobile}
                                onPress={() => {
                                    if (team?.responsable?.contact?.telephoneMobile) {
                                        Linking.openURL(`tel:${team.responsable.contact.telephoneMobile}`);
                                    }
                                }}
                                actionIcon="call"
                            />
                        </View>
                    </View>

                    {/* Actions rapides */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Actions rapides</Text>
                        <View style={styles.quickActions}>
                            {(team?.responsable?.contact?.email || team?.responsableEmail) && (
                                <QuickActionButton
                                    icon="mail"
                                    label="Envoyer un email"
                                    onPress={handleContactResponsable}
                                    color={Colors.primary}
                                />
                            )}
                            {team?.responsable?.contact?.telephoneMobile && (
                                <QuickActionButton
                                    icon="call"
                                    label="Appeler mobile"
                                    onPress={() => {
                                        if (team?.responsable?.contact?.telephoneMobile) {
                                            Linking.openURL(`tel:${team.responsable.contact.telephoneMobile}`);
                                        }
                                    }}
                                    color={Colors.success}
                                />
                            )}
                            {team?.responsable?.contact?.telephoneInterne && (
                                <QuickActionButton
                                    icon="business"
                                    label="Appeler interne"
                                    onPress={() => {
                                        if (team?.responsable?.contact?.telephoneInterne) {
                                            Linking.openURL(`tel:${team.responsable.contact.telephoneInterne}`);
                                        }
                                    }}
                                    color={Colors.secondary}
                                />
                            )}
                        </View>
                    </View>
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="person-outline" size={64} color={Colors.textMuted} />
                    <Text style={styles.emptyStateText}>Aucun responsable assigné</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Cette équipe n'a pas encore de responsable désigné
                    </Text>
                </View>
            )}
        </View>
    );

    const renderMembersTab = () => {
        const nombreMembres = team?.membres?.length || team?.nombreMembres || 0;

        return (
            <View style={styles.tabContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Membres de l'équipe ({nombreMembres})
                    </Text>

                    {team?.membres && team.membres.length > 0 ? (
                        <View style={styles.membersList}>
                            {team.membres.map((membre) => (
                                <View key={membre.id} style={styles.memberCard}>
                                    <View style={styles.memberHeader}>
                                        <View style={styles.memberAvatarContainer}>
                                            <View style={styles.memberAvatar}>
                                                <Ionicons name="person" size={24} color={Colors.primary} />
                                            </View>
                                            {team?.responsable?.id === membre.id && (
                                                <View style={styles.responsableBadge}>
                                                    <Ionicons name="star" size={12} color={Colors.surface} />
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.memberInfo}>
                                            <Text style={styles.memberName}>
                                                {membre.prenom} {membre.nom}
                                            </Text>
                                            <Text style={styles.memberMatricule}>
                                                {membre.matricule || 'Matricule non défini'}
                                            </Text>
                                            <Text style={styles.memberPoste}>
                                                {membre.poste?.nom || 'Poste non défini'}
                                            </Text>
                                            {membre.contact?.email && (
                                                <Text style={styles.memberEmail}>
                                                    {membre.contact.email}
                                                </Text>
                                            )}
                                        </View>

                                        {team?.responsable?.id === membre.id && (
                                            <View style={styles.responsableChip}>
                                                <Text style={styles.responsableChipText}>
                                                    Responsable
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
                            <Text style={styles.emptyStateText}>Aucun membre</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Cette équipe n'a pas encore de membres
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <EmptyState
                    icon="alert-circle-outline"
                    title="Erreur de chargement"
                    description={error}
                    actionLabel="Réessayer"
                    onActionPress={() => {
                        dispatch(clearTeamsError());
                        loadTeamDetail();
                    }}
                />
            </SafeAreaView>
        );
    }

    if (!team) {
        return (
            <SafeAreaView style={styles.container}>
                <EmptyState
                    icon="alert-circle-outline"
                    title="Équipe introuvable"
                    description="Cette équipe n'existe pas ou a été supprimée"
                />
            </SafeAreaView>
        );
    }

    const nombreMembres = team?.membres?.length || team?.nombreMembres || 0;

    return (
        <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

                {/* 🎨 EN-TÊTE AVEC GRADIENT ORANGE (selon la charte équipes) */}
                <LinearGradient colors={Gradients.secondary} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Détails de l'équipe</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Informations principales de l'équipe */}
                    <View style={styles.teamHeader}>
                        <View style={styles.teamIconContainer}>
                            <View style={styles.teamIcon}>
                                <Ionicons name="people" size={40} color={Colors.secondary} />
                            </View>
                            <View style={[styles.teamStatusDot, {
                                backgroundColor: getStatutColor(team.statut || '')
                            }]}>
                                <Ionicons
                                    name={getStatutIcon(team.statut || '')}
                                    size={16}
                                    color={Colors.surface}
                                />
                            </View>
                        </View>

                        <View style={styles.teamMainInfo}>
                            <Text style={styles.teamName}>
                                {safeDisplay(team.nom, 'Équipe sans nom')}
                            </Text>
                            <Text style={styles.teamStatus}>
                                {safeDisplay(team.statut, 'Statut inconnu')}
                            </Text>
                            <Text style={styles.teamMemberCount}>
                                {nombreMembres} membre{nombreMembres > 1 ? 's' : ''}
                            </Text>
                            {(team.responsable || team.responsableNom) && (
                                <Text style={styles.teamResponsable}>
                                    Responsable: {team.responsable ?
                                        `${team.responsable.prenom} ${team.responsable.nom}` :
                                        team.responsableNom
                                    }
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Onglets */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'info' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('info')}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="information-circle-outline"
                                size={20}
                                color={activeTab === 'info' ? Colors.secondary : 'rgba(255,255,255,0.7)'}
                            />
                            <Text style={[styles.tabButtonText, activeTab === 'info' && styles.tabButtonTextActive]}>
                                Infos
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'contact' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('contact')}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="call-outline"
                                size={20}
                                color={activeTab === 'contact' ? Colors.secondary : 'rgba(255,255,255,0.7)'}
                            />
                            <Text style={[styles.tabButtonText, activeTab === 'contact' && styles.tabButtonTextActive]}>
                                Contact
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'members' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('members')}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="people-outline"
                                size={20}
                                color={activeTab === 'members' ? Colors.secondary : 'rgba(255,255,255,0.7)'}
                            />
                            <Text style={[styles.tabButtonText, activeTab === 'members' && styles.tabButtonTextActive]}>
                                Membres
                            </Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Contenu */}
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={onRefresh}
                            colors={[Colors.secondary]}
                            tintColor={Colors.secondary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {renderTabContent()}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

// =============================================================================
// 🎨 STYLES AVEC CHARTE GRAPHIQUE UNIFORME
// =============================================================================

const styles = StyleSheet.create({
    // Container principal
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },

    loadingText: {
        ...Typography.body,
        color: Colors.textMuted,
    },

    // 🎨 HEADER UNIFORME (gradient orange équipes)
    header: {
        paddingBottom: 0,
    },

    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: 10,
        paddingBottom: Spacing.lg,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        ...Typography.h5,
        color: Colors.surface,
    },

    placeholder: {
        width: 40,
    },

    // 🎨 HEADER ÉQUIPE UNIFORME
    teamHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
    },

    teamIconContainer: {
        position: 'relative',
        marginRight: Spacing.lg,
    },

    teamIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.9),
        justifyContent: 'center',
        alignItems: 'center',
    },

    teamStatusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.surface,
    },

    teamMainInfo: {
        flex: 1,
    },

    teamName: {
        ...Typography.h4,
        color: Colors.surface,
        marginBottom: 4,
    },

    teamStatus: {
        ...Typography.body,
        color: StyleUtils.withOpacity(Colors.surface, 0.8),
        marginBottom: 2,
    },

    teamMemberCount: {
        ...Typography.bodySmall,
        color: StyleUtils.withOpacity(Colors.surface, 0.9),
        marginBottom: 2,
    },

    teamResponsable: {
        ...Typography.bodySmall,
        color: StyleUtils.withOpacity(Colors.surface, 0.9),
        fontWeight: '600',
    },

    // 🎨 ONGLETS UNIFORMES
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.1),
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        padding: 4,
        marginBottom: 10,
    },

    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.sm,
        gap: Spacing.xs,
    },

    tabButtonActive: {
        backgroundColor: Colors.surface,
    },

    tabButtonText: {
        ...Typography.caption,
        color: StyleUtils.withOpacity(Colors.surface, 0.7),
        fontWeight: '600',
    },

    tabButtonTextActive: {
        color: Colors.secondary,
    },

    // Contenu
    content: {
        flex: 1,
    },

    tabContent: {
        padding: Spacing.lg,
    },

    // Sections
    section: {
        marginBottom: Spacing.xl,
    },

    sectionTitle: {
        ...Typography.h6,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },

    // 🎨 CARTE INFO UNIFORME
    infoCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...StyleUtils.getUniformShadow('low'),
    },

    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },

    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.secondarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    infoContent: {
        flex: 1,
    },

    infoLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginBottom: 2,
    },

    infoValue: {
        ...Typography.body,
        color: Colors.textPrimary,
        fontWeight: '500',
    },

    // Description
    descriptionCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...StyleUtils.getUniformShadow('low'),
    },

    descriptionText: {
        ...Typography.body,
        color: Colors.textPrimary,
        lineHeight: 22,
    },

    // 🎨 CARTE RESPONSABLE UNIFORME
    responsableCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...StyleUtils.getUniformShadow('low'),
    },

    responsableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    responsableAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.secondarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    responsableInfo: {
        flex: 1,
    },

    responsableName: {
        ...Typography.h6,
        color: Colors.textPrimary,
        marginBottom: 4,
    },

    responsableTitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginBottom: 2,
    },

    responsableEmail: {
        ...Typography.caption,
        color: Colors.textMuted,
    },

    // Contact
    contactList: {
        gap: Spacing.sm,
    },

    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        ...StyleUtils.getUniformShadow('low'),
    },

    contactItemDisabled: {
        opacity: 0.5,
    },

    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.secondarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    contactContent: {
        flex: 1,
    },

    contactLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginBottom: 4,
    },

    contactValue: {
        ...Typography.body,
        color: Colors.textPrimary,
        fontWeight: '500',
    },

    contactValueDisabled: {
        color: Colors.textMuted,
    },

    // Actions rapides
    quickActions: {
        gap: Spacing.sm,
    },

    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.md,
    },

    quickActionLabel: {
        ...Typography.body,
        fontWeight: '600',
    },

    // 🎨 LISTE MEMBRES UNIFORME
    membersList: {
        gap: Spacing.sm,
    },

    memberCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...StyleUtils.getUniformShadow('low'),
    },

    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    memberAvatarContainer: {
        position: 'relative',
        marginRight: Spacing.md,
    },

    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },

    responsableBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.surface,
    },

    memberInfo: {
        flex: 1,
    },

    memberName: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 2,
    },

    memberMatricule: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginBottom: 2,
    },

    memberPoste: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginBottom: 2,
    },

    memberEmail: {
        ...Typography.caption,
        color: Colors.textMuted,
    },

    responsableChip: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },

    responsableChipText: {
        ...Typography.caption,
        color: Colors.surface,
        fontWeight: '600',
    },

    // 🎨 EMPTY STATE UNIFORME
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        ...StyleUtils.getUniformShadow('low'),
    },

    emptyStateText: {
        ...Typography.body,
        color: Colors.textMuted,
        marginTop: Spacing.lg,
        fontWeight: '600',
    },

    emptyStateSubtext: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        marginTop: 4,
        textAlign: 'center',
    },
});