import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Linking,
    ActivityIndicator,
    StyleSheet,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Header } from '../../components/ui/Header';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';
import { Meeting } from '../../types/meetings';
import { meetingService } from '@/services/meetingService';

// Types pour la navigation
type MeetingsStackParamList = {
    MeetingsList: undefined;
    MeetingsCalendar: undefined;
};

type MeetingsScreenNavigationProp = StackNavigationProp<MeetingsStackParamList, 'MeetingsList'>;

// Types pour les statuts
type MeetingStatus = 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE' | 'PEUT_ETRE';

const MeetingsScreen: React.FC = () => {
    const navigation = useNavigation<MeetingsScreenNavigationProp>();
    const { user, loading: userLoading } = useCurrentUser();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'pending'>('upcoming');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    
    // 🔍 RECHERCHE
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    
    // États pour les modals
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseComment, setResponseComment] = useState('');

    // Fonction pour convertir les dates array en Date
    const arrayToDate = (dateArray: any) => {
        if (!dateArray || !Array.isArray(dateArray)) return new Date();
        return new Date(
            dateArray[0],     // année
            dateArray[1] - 1, // mois (0-11)
            dateArray[2],     // jour
            dateArray[3] || 0, // heure
            dateArray[4] || 0  // minute
        );
    };

    // Charger les réunions avec normalisation correcte
    const loadMeetings = useCallback(async () => {
        if (!user) return;

        console.log('🔄 Chargement des réunions pour l\'utilisateur:', user.employeId);

        try {
            const response = await meetingService.getMyMeetings();
            console.log('📥 Réponse complète:', response);
            
            if (response.success) {
                console.log('✅ Données reçues:', response.data.length, 'réunions');
                
                const normalizedMeetings = response.data.map(meeting => {
                    const normalizedMeeting = {
                        ...meeting,
                        dateDebut: Array.isArray(meeting.dateDebut) 
                            ? arrayToDate(meeting.dateDebut)
                            : new Date(meeting.dateDebut),
                        dateFin: Array.isArray(meeting.dateFin)
                            ? arrayToDate(meeting.dateFin) 
                            : new Date(meeting.dateFin),
                    };
                    
                    // 🔧 LOG DÉTAILLÉ pour débugger les boutons d'action
                    console.log('🔍 Réunion:', {
                        id: normalizedMeeting.id,
                        titre: normalizedMeeting.titre,
                        myStatus: normalizedMeeting.myStatus,
                        dateDebut: normalizedMeeting.dateDebut,
                        isPast: isPast(normalizedMeeting.dateDebut),
                        canShowButtons: normalizedMeeting.myStatus === 'EN_ATTENTE' && !isPast(normalizedMeeting.dateDebut)
                    });
                    
                    return normalizedMeeting;
                });
                
                console.log('🎯 Réunions normalisées:', normalizedMeetings.length);
                setMeetings(normalizedMeetings);
            } else {
                console.error('❌ Échec de la réponse API:', response);
                Alert.alert('Erreur', 'Impossible de charger les réunions');
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des réunions:', error);
            Alert.alert('Erreur', 'Impossible de charger les réunions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    // Rafraîchir lors du focus
    useFocusEffect(
        useCallback(() => {
            if (user && !userLoading) {
                loadMeetings();
            }
        }, [user, userLoading, loadMeetings])
    );

    // Pull to refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadMeetings();
    }, [loadMeetings]);

    // Répondre à une invitation
    const handleResponse = async (meeting: Meeting, status: string, comment?: string) => {
        if (!user?.employeId) {
            Alert.alert('Erreur', 'Utilisateur non connecté ou ID employé manquant');
            return;
        }

        try {
            console.log('🔄 Réponse à l\'invitation:', { meetingId: meeting.id, status, comment });
            
            const response = await meetingService.respondToInvitation(
                meeting.id,
                user.employeId.toString(),
                status,
                comment
            );

            if (response.success) {
                Alert.alert('Succès', `Réponse enregistrée : ${getStatusLabel(status as MeetingStatus)}`);
                loadMeetings();
                setShowResponseModal(false);
                setSelectedMeeting(null);
                setResponseComment('');
            } else {
                Alert.alert('Erreur', response.error || 'Erreur lors de la réponse');
            }
        } catch (error) {
            console.error('❌ Erreur réponse:', error);
            Alert.alert('Erreur', 'Erreur lors de la réponse');
        }
    };

    // Rejoindre la visio
    const handleJoinVisio = (lienVisio: string) => {
        if (lienVisio) {
            Linking.openURL(lienVisio);
        }
    };

    // Voir les détails d'une réunion
    const handleShowDetails = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        setShowDetailModal(true);
    };

    // Afficher le modal de réponse
    const handleShowResponseModal = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        setShowResponseModal(true);
        setResponseComment('');
    };

    // 📅 NAVIGUER VERS LE CALENDRIER
    const handleNavigateToCalendar = () => {
        navigation.navigate('MeetingsCalendar');
    };

    // 🔍 FILTRER LES RÉUNIONS (avec recherche ET onglets)
    const getFilteredMeetings = () => {
        const now = new Date();
        console.log('🔍 Filtrage des réunions. Total:', meetings.length, 'Onglet:', activeTab, 'Recherche:', searchQuery);

        // D'abord filtrer par onglet
        let filteredMeetings = [];
        
        switch (activeTab) {
            case 'upcoming':
                filteredMeetings = meetings.filter(m => {
                    const isUpcoming = new Date(m.dateDebut) > now;
                    return isUpcoming;
                });
                break;
            case 'past':
                filteredMeetings = meetings.filter(m => {
                    const isPastMeeting = new Date(m.dateFin) < now;
                    return isPastMeeting;
                });
                break;
            case 'pending':
                filteredMeetings = meetings.filter(m => {
                    const isPending = m.myStatus === 'EN_ATTENTE' && new Date(m.dateDebut) > now;
                    console.log('🔍 Pending check:', m.titre, m.myStatus, new Date(m.dateDebut) > now, isPending);
                    return isPending;
                });
                break;
            default:
                filteredMeetings = meetings;
        }

        // Ensuite filtrer par recherche
        if (searchQuery.trim()) {
            filteredMeetings = filteredMeetings.filter(meeting =>
                meeting.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meeting.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meeting.organisateurNom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meeting.lieu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meeting.salle?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        console.log('🎯 Réunions filtrées:', filteredMeetings.length);
        return filteredMeetings;
    };

    // Helpers
    const getStatusBadgeStyle = (status: MeetingStatus) => {
        const statusStyles: Record<MeetingStatus, { backgroundColor: string }> = {
            'EN_ATTENTE': { backgroundColor: Colors.warning },
            'ACCEPTE': { backgroundColor: Colors.success },
            'REFUSE': { backgroundColor: Colors.error },
            'PEUT_ETRE': { backgroundColor: Colors.info },
        };
        return statusStyles[status] || { backgroundColor: Colors.textMuted };
    };

    const getStatusLabel = (status: MeetingStatus) => {
        const labels: Record<MeetingStatus, string> = {
            'EN_ATTENTE': 'En attente',
            'ACCEPTE': 'Accepté',
            'REFUSE': 'Refusé',
            'PEUT_ETRE': 'Peut-être',
        };
        return labels[status] || status;
    };

    const formatMeetingTime = (dateDebut: Date, dateFin: Date) => {
        if (isToday(dateDebut)) {
            return `Aujourd'hui, ${format(dateDebut, 'HH:mm', { locale: fr })} - ${format(dateFin, 'HH:mm', { locale: fr })}`;
        } else if (isTomorrow(dateDebut)) {
            return `Demain, ${format(dateDebut, 'HH:mm', { locale: fr })} - ${format(dateFin, 'HH:mm', { locale: fr })}`;
        } else {
            return `${format(dateDebut, 'dd MMM yyyy, HH:mm', { locale: fr })} - ${format(dateFin, 'HH:mm', { locale: fr })}`;
        }
    };

    // 🔧 FONCTION COMPLÈTE renderMeeting avec BOUTONS D'ACTION VISIBLES
    const renderMeeting = (meeting: Meeting) => {
        const isPastMeeting = isPast(meeting.dateDebut as Date);
        const canRespond = meeting.myStatus === 'EN_ATTENTE' && !isPastMeeting;
        
        console.log('🎨 Rendu meeting:', {
            titre: meeting.titre,
            myStatus: meeting.myStatus,
            isPast: isPastMeeting,
            canRespond
        });

        return (
            <View key={meeting.id} style={styles.meetingCard}>
                {/* Header avec titre et statut */}
                <TouchableOpacity onPress={() => handleShowDetails(meeting)}>
                    <View style={styles.meetingHeader}>
                        <Text style={styles.meetingTitle}>{meeting.titre}</Text>
                        {meeting.myStatus && (
                            <View style={[styles.statusBadge, getStatusBadgeStyle(meeting.myStatus as MeetingStatus)]}>
                                <Text style={styles.statusText}>{getStatusLabel(meeting.myStatus as MeetingStatus)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Informations temporelles */}
                    <Text style={styles.meetingTime}>
                        {formatMeetingTime(meeting.dateDebut as Date, meeting.dateFin as Date)}
                    </Text>

                    {/* Lieu ou lien visio */}
                    {(meeting.salle || meeting.lieu || meeting.lienVisio) && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                            <Text style={styles.meetingLocation}>
                                {meeting.salle || meeting.lieu || 'Réunion en ligne'}
                            </Text>
                        </View>
                    )}

                    {/* Description */}
                    {meeting.description && (
                        <Text style={styles.meetingDescription} numberOfLines={2}>
                            {meeting.description}
                        </Text>
                    )}

                    {/* Informations organisateur */}
                    {meeting.organisateurNom && (
                        <View style={styles.organizerContainer}>
                            <Ionicons name="person-outline" size={14} color={Colors.textMuted} />
                            <Text style={styles.organizerText}>Organisé par {meeting.organisateurNom}</Text>
                        </View>
                    )}

                    {/* Participants */}
                    {meeting.nombreParticipants && (
                        <View style={styles.participantsContainer}>
                            <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
                            <Text style={styles.participantsText}>
                                {meeting.nombreParticipants} participant(s)
                                {meeting.nombreAcceptes && (
                                    <> • {meeting.nombreAcceptes} accepté(s)</>
                                )}
                                {meeting.nombreEnAttente && (
                                    <> • {meeting.nombreEnAttente} en attente</>
                                )}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* 🔧 SECTION DES ACTIONS - TOUJOURS VISIBLE */}
                <View style={styles.actionsContainer}>
                    {/* 🔥 BOUTONS DE RÉPONSE RAPIDE - Condition simplifiée */}
                    {canRespond && (
                        <View style={styles.responseButtons}>
                            <TouchableOpacity
                                style={[styles.responseButton, styles.acceptButton]}
                                onPress={() => handleResponse(meeting, 'ACCEPTE')}
                            >
                                <Ionicons name="checkmark" size={16} color={Colors.success} />
                                <Text style={[styles.responseButtonText, { color: Colors.success }]}>Accepter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.responseButton, styles.declineButton]}
                                onPress={() => handleResponse(meeting, 'REFUSE')}
                            >
                                <Ionicons name="close" size={16} color={Colors.error} />
                                <Text style={[styles.responseButtonText, { color: Colors.error }]}>Refuser</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.responseButton, styles.maybeButton]}
                                onPress={() => handleShowResponseModal(meeting)}
                            >
                                <Ionicons name="help" size={16} color={Colors.info} />
                                <Text style={[styles.responseButtonText, { color: Colors.info }]}>Peut-être</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Boutons secondaires dans une ligne séparée */}
                    <View style={styles.secondaryActions}>
                        {/* Bouton pour rejoindre la visio si disponible */}
                        {meeting.lienVisio && !isPastMeeting && (
                            <TouchableOpacity
                                style={styles.joinButton}
                                onPress={() => handleJoinVisio(meeting.lienVisio!)}
                            >
                                <Ionicons name="videocam" size={16} color={Colors.surface} />
                                <Text style={styles.joinButtonText}>Rejoindre la visio</Text>
                            </TouchableOpacity>
                        )}

                        {/* Bouton pour voir les détails - toujours visible */}
                        <TouchableOpacity
                            style={styles.detailsButton}
                            onPress={() => handleShowDetails(meeting)}
                        >
                            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
                            <Text style={styles.detailsButtonText}>Détails</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const filteredMeetings = getFilteredMeetings();

    if (userLoading || loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="Mes Réunions" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Chargement des réunions...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header 
                title="Mes Réunions"
                rightIcon={showSearch ? "close" : "search"}
                onRightPress={() => setShowSearch(!showSearch)}
            />
            
            <View style={styles.content}>
                {/* 🔍 BARRE DE RECHERCHE */}
                {showSearch && (
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputContainer}>
                            <Ionicons name="search" size={20} color={Colors.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher une réunion..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* 📅 BARRE D'OUTILS AVEC BOUTON CALENDRIER */}
                <View style={styles.toolbarContainer}>
                    <TouchableOpacity
                        style={styles.calendarToggleButton}
                        onPress={handleNavigateToCalendar}
                    >
                        <Ionicons name="calendar" size={20} color={Colors.primary} />
                        <Text style={styles.calendarToggleText}>Vue calendrier</Text>
                    </TouchableOpacity>
                </View>

                {/* Onglets */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                        onPress={() => setActiveTab('upcoming')}
                    >
                        <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                            À venir
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                        onPress={() => setActiveTab('pending')}
                    >
                        <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                            En attente
                        </Text>
                        {/* Badge du nombre de réunions en attente */}
                        {meetings.filter(m => m.myStatus === 'EN_ATTENTE' && new Date(m.dateDebut) > new Date()).length > 0 && (
                            <View style={styles.tabBadge}>
                                <Text style={styles.tabBadgeText}>
                                    {meetings.filter(m => m.myStatus === 'EN_ATTENTE' && new Date(m.dateDebut) > new Date()).length}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                        onPress={() => setActiveTab('past')}
                    >
                        <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                            Passées
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Liste des réunions */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {filteredMeetings.length > 0 ? (
                        filteredMeetings.map(renderMeeting)
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={64} color={Colors.textMuted} />
                            <Text style={styles.emptyStateText}>
                                {searchQuery ? 'Aucune réunion ne correspond à votre recherche' :
                                 activeTab === 'upcoming' ? 'Aucune réunion à venir' :
                                 activeTab === 'pending' ? 'Aucune invitation en attente' :
                                 'Aucune réunion passée'}
                            </Text>
                            {searchQuery && (
                                <TouchableOpacity
                                    style={styles.clearSearchButton}
                                    onPress={() => setSearchQuery('')}
                                >
                                    <Text style={styles.clearSearchText}>Effacer la recherche</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Modal des détails */}
            <Modal
                visible={showDetailModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowDetailModal(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Détails de la réunion</Text>
                        <TouchableOpacity
                            onPress={() => setShowDetailModal(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    
                    {selectedMeeting && (
                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.modalMeetingTitle}>{selectedMeeting.titre}</Text>
                            
                            <View style={styles.detailItem}>
                                <Ionicons name="calendar" size={20} color={Colors.primary} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Date et heure</Text>
                                    <Text style={styles.detailValue}>
                                        {formatMeetingTime(selectedMeeting.dateDebut as Date, selectedMeeting.dateFin as Date)}
                                    </Text>
                                </View>
                            </View>

                            {(selectedMeeting.salle || selectedMeeting.lieu) && (
                                <View style={styles.detailItem}>
                                    <Ionicons name="location" size={20} color={Colors.primary} />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Lieu</Text>
                                        <Text style={styles.detailValue}>{selectedMeeting.salle || selectedMeeting.lieu}</Text>
                                    </View>
                                </View>
                            )}

                            {selectedMeeting.description && (
                                <View style={styles.detailItem}>
                                    <Ionicons name="document-text" size={20} color={Colors.primary} />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Description</Text>
                                        <Text style={styles.detailValue}>{selectedMeeting.description}</Text>
                                    </View>
                                </View>
                            )}

                            {selectedMeeting.organisateurNom && (
                                <View style={styles.detailItem}>
                                    <Ionicons name="person" size={20} color={Colors.primary} />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Organisateur</Text>
                                        <Text style={styles.detailValue}>{selectedMeeting.organisateurNom}</Text>
                                    </View>
                                </View>
                            )}

                            {selectedMeeting.nombreParticipants && (
                                <View style={styles.detailItem}>
                                    <Ionicons name="people" size={20} color={Colors.primary} />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Participants</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedMeeting.nombreParticipants} participant(s) invité(s)
                                        </Text>
                                        {(selectedMeeting.nombreAcceptes || selectedMeeting.nombreEnAttente || selectedMeeting.nombreRefuses) && (
                                            <Text style={styles.detailSubValue}>
                                                {selectedMeeting.nombreAcceptes || 0} accepté(s), {selectedMeeting.nombreEnAttente || 0} en attente, {selectedMeeting.nombreRefuses || 0} refusé(s)
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )}

                            {selectedMeeting.myStatus && (
                                <View style={styles.detailItem}>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Mon statut</Text>
                                        <View style={[styles.statusBadge, getStatusBadgeStyle(selectedMeeting.myStatus as MeetingStatus)]}>
                                            <Text style={styles.statusText}>{getStatusLabel(selectedMeeting.myStatus as MeetingStatus)}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {selectedMeeting.lienVisio && (
                                <TouchableOpacity
                                    style={styles.joinButton}
                                    onPress={() => handleJoinVisio(selectedMeeting.lienVisio!)}
                                >
                                    <Ionicons name="videocam" size={16} color={Colors.surface} />
                                    <Text style={styles.joinButtonText}>Rejoindre la visio</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    )}
                </SafeAreaView>
            </Modal>

            {/* Modal de réponse avec commentaire */}
            <Modal
                visible={showResponseModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowResponseModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.responseModalContainer}>
                        <Text style={styles.responseModalTitle}>Répondre à l'invitation</Text>
                        <Text style={styles.responseModalSubtitle}>{selectedMeeting?.titre}</Text>
                        
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Commentaire (optionnel)"
                            value={responseComment}
                            onChangeText={setResponseComment}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.responseModalButtons}>
                            <TouchableOpacity
                                style={[styles.modalResponseButton, styles.acceptButton]}
                                onPress={() => handleResponse(selectedMeeting!, 'ACCEPTE', responseComment)}
                            >
                                <Ionicons name="checkmark" size={16} color={Colors.success} />
                                <Text style={[styles.modalResponseButtonText, { color: Colors.success }]}>Accepter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalResponseButton, styles.maybeButton]}
                                onPress={() => handleResponse(selectedMeeting!, 'PEUT_ETRE', responseComment)}
                            >
                                <Ionicons name="help" size={16} color={Colors.info} />
                                <Text style={[styles.modalResponseButtonText, { color: Colors.info }]}>Peut-être</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalResponseButton, styles.declineButton]}
                                onPress={() => handleResponse(selectedMeeting!, 'REFUSE', responseComment)}
                            >
                                <Ionicons name="close" size={16} color={Colors.error} />
                                <Text style={[styles.modalResponseButtonText, { color: Colors.error }]}>Refuser</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowResponseModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingText: {
        ...Typography.body,
        color: Colors.textMuted,
        marginTop: Spacing.md,
    },

    // 🔍 RECHERCHE
    searchContainer: {
        marginBottom: Spacing.md,
    },

    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        ...StyleUtils.getUniformShadow('low'),
    },

    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        ...Typography.body,
        color: Colors.textPrimary,
    },

    clearSearchButton: {
        marginTop: Spacing.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
    },

    clearSearchText: {
        ...Typography.bodySmall,
        color: Colors.surface,
        textAlign: 'center',
    },

    // 📅 BARRE D'OUTILS
    toolbarContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: Spacing.md,
    },

    calendarToggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.primary,
        gap: Spacing.xs,
        ...StyleUtils.getUniformShadow('low'),
    },

    calendarToggleText: {
        ...Typography.bodySmall,
        color: Colors.primary,
        fontWeight: '600',
    },

    // Onglets
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xs,
        marginBottom: Spacing.lg,
        ...StyleUtils.getUniformShadow('low'),
    },

    tab: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.md,
        position: 'relative',
    },

    activeTab: {
        backgroundColor: Colors.primary,
    },

    tabText: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        fontWeight: '500',
    },

    activeTabText: {
        color: Colors.surface,
        fontWeight: '600',
    },

    tabBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: Colors.error,
        borderRadius: BorderRadius.circle,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },

    tabBadgeText: {
        ...Typography.caption,
        color: Colors.surface,
        fontSize: 10,
        fontWeight: '600',
    },

    // Carte de réunion
    meetingCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        ...StyleUtils.getUniformShadow('low'),
    },

    meetingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },

    meetingTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
        flex: 1,
        marginRight: Spacing.sm,
    },

    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.circle,
    },

    statusText: {
        ...Typography.caption,
        color: Colors.surface,
        fontWeight: '600',
    },

    meetingTime: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },

    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },

    meetingLocation: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        marginLeft: 4,
    },

    meetingDescription: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        lineHeight: 20,
    },

    organizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },

    organizerText: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        marginLeft: 4,
    },

    participantsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },

    participantsText: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        marginLeft: 4,
    },

    // Actions
    actionsContainer: {
        gap: Spacing.sm,
    },

    responseButtons: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },

    secondaryActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },

    responseButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: 4,
    },

    acceptButton: {
        borderColor: Colors.success,
        backgroundColor: Colors.success + '20',
    },

    declineButton: {
        borderColor: Colors.error,
        backgroundColor: Colors.error + '20',
    },

    maybeButton: {
        borderColor: Colors.info,
        backgroundColor: Colors.info + '20',
    },

    responseButtonText: {
        ...Typography.bodySmall,
        fontWeight: '600',
    },

    joinButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: 4,
    },

    joinButtonText: {
        ...Typography.bodySmall,
        color: Colors.surface,
        fontWeight: '600',
    },

    detailsButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.primary,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: 4,
    },

    detailsButtonText: {
        ...Typography.bodySmall,
        color: Colors.primary,
        fontWeight: '600',
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },

    emptyStateText: {
        ...Typography.body,
        color: Colors.textMuted,
        marginTop: Spacing.lg,
        textAlign: 'center',
        fontWeight: '600',
    },

    // Modals
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },

    modalTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
    },

    closeButton: {
        padding: Spacing.sm,
    },

    modalContent: {
        flex: 1,
        padding: Spacing.lg,
    },

    modalMeetingTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
        marginBottom: Spacing.lg,
    },

    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '30',
        gap: Spacing.sm,
    },

    detailContent: {
        flex: 1,
    },

    detailLabel: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        fontWeight: '600',
        marginBottom: 4,
    },

    detailValue: {
        ...Typography.body,
        color: Colors.textPrimary,
    },

    detailSubValue: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        marginTop: 2,
    },

    // Modal de réponse
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },

    responseModalContainer: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        width: '100%',
        maxWidth: 400,
    },

    responseModalTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },

    responseModalSubtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },

    commentInput: {
        ...Typography.body,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        textAlignVertical: 'top',
        minHeight: 80,
    },

    responseModalButtons: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },

    modalResponseButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: 4,
    },

    modalResponseButtonText: {
        ...Typography.bodySmall,
        fontWeight: '600',
    },

    cancelButton: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },

    cancelButtonText: {
        ...Typography.body,
        color: Colors.textMuted,
    },
});

export default MeetingsScreen;