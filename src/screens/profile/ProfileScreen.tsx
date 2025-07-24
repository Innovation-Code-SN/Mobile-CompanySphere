// src/screens/profile/ProfileScreen.tsx - VERSION AVEC MISE À JOUR PHOTO
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Dimensions,
    Image,
    TextInput,
    Modal,
    ActionSheetIOS,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

// Services
import { employeeService, Employee } from '../../services/employeeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

interface ContactEditModalProps {
    visible: boolean;
    employee: Employee | null;
    onClose: () => void;
    onSave: (contactData: any) => void;
}

const ContactEditModal: React.FC<ContactEditModalProps> = ({
    visible,
    employee,
    onClose,
    onSave
}) => {
    const [formData, setFormData] = useState({
        email: '',
        telephoneMobile: '',
        telephoneInterne: '',
        adresseEnEntreprise: '',
    });

    useEffect(() => {
        if (employee?.contact) {
            setFormData({
                email: employee.contact.email || '',
                telephoneMobile: employee.contact.telephoneMobile || '',
                telephoneInterne: employee.contact.telephoneInterne || '',
                adresseEnEntreprise: employee.contact.adresseEnEntreprise || '',
            });
        }
    }, [employee]);

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={modalStyles.modalContainer}>
                {/* 🎨 HEADER MODAL UNIFORME */}
                <LinearGradient colors={Gradients.primary} style={modalStyles.modalHeader}>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color={Colors.surface} />
                    </TouchableOpacity>
                    <Text style={modalStyles.modalTitle}>Modifier les contacts</Text>
                    <TouchableOpacity onPress={handleSave} style={modalStyles.saveButton}>
                        <Text style={modalStyles.saveButtonText}>Sauvegarder</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <ScrollView style={modalStyles.modalContent}>
                    {/* Email */}
                    <View style={modalStyles.inputGroup}>
                        <Text style={modalStyles.inputLabel}>Email professionnel</Text>
                        <View style={modalStyles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={Colors.primary} style={modalStyles.inputIcon} />
                            <TextInput
                                style={modalStyles.input}
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                placeholder="votre.email@entreprise.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Téléphone mobile */}
                    <View style={modalStyles.inputGroup}>
                        <Text style={modalStyles.inputLabel}>Téléphone mobile</Text>
                        <View style={modalStyles.inputContainer}>
                            <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} style={modalStyles.inputIcon} />
                            <TextInput
                                style={modalStyles.input}
                                value={formData.telephoneMobile}
                                onChangeText={(text) => setFormData({ ...formData, telephoneMobile: text })}
                                placeholder="+221 XX XXX XX XX"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Téléphone interne */}
                    <View style={modalStyles.inputGroup}>
                        <Text style={modalStyles.inputLabel}>Téléphone interne</Text>
                        <View style={modalStyles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color={Colors.primary} style={modalStyles.inputIcon} />
                            <TextInput
                                style={modalStyles.input}
                                value={formData.telephoneInterne}
                                onChangeText={(text) => setFormData({ ...formData, telephoneInterne: text })}
                                placeholder="Poste XXXX"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Adresse en entreprise */}
                    <View style={modalStyles.inputGroup}>
                        <Text style={modalStyles.inputLabel}>Adresse en entreprise</Text>
                        <View style={modalStyles.inputContainer}>
                            <Ionicons name="location-outline" size={20} color={Colors.primary} style={modalStyles.inputIcon} />
                            <TextInput
                                style={[modalStyles.input, modalStyles.inputMultiline]}
                                value={formData.adresseEnEntreprise}
                                onChangeText={(text) => setFormData({ ...formData, adresseEnEntreprise: text })}
                                placeholder="Bureau, étage, bâtiment..."
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default function ProfileScreen({ navigation }: any) {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

    const { logout } = useAuth();

    useFocusEffect(
        React.useCallback(() => {
            loadProfile();
        }, [])
    );

    const loadProfile = async () => {
        try {
            console.log('🔄 Chargement du profil...');
            setIsLoading(true);

            const response = await employeeService.getMyProfile();
            console.log('👤 Réponse profil:', response.success);

            if (response.success) {
                setEmployee(response.data);
                console.log('✅ Profil chargé avec succès', response.data);

                console.log('✅ Profil chargé:', response.data.prenom, response.data.nom);
            } else {
                console.log('❌ Erreur chargement profil:', response.message);
                Alert.alert('Erreur', response.message || 'Impossible de charger le profil');
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement du profil:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors du chargement');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProfile();
    };

    // 📸 FONCTION POUR CHANGER LA PHOTO DE PROFIL (Compatible Web + Mobile)
    const handleChangePhoto = () => {
        if (Platform.OS === 'web') {
            // Version Web : utiliser input file HTML
            handleWebPhotoSelection();
        } else {
            // Version Mobile : utiliser ActionSheet/Alert
            const options = [
                'Prendre une photo',
                'Choisir dans la galerie',
                'Supprimer la photo',
                'Annuler'
            ];

            if (Platform.OS === 'ios') {
                ActionSheetIOS.showActionSheetWithOptions(
                    {
                        options,
                        cancelButtonIndex: 3,
                        destructiveButtonIndex: 2,
                        title: 'Changer la photo de profil'
                    },
                    (buttonIndex) => {
                        handlePhotoSelection(buttonIndex);
                    }
                );
            } else {
                Alert.alert(
                    'Changer la photo de profil',
                    'Choisissez une option',
                    [
                        { text: 'Prendre une photo', onPress: () => handlePhotoSelection(0) },
                        { text: 'Choisir dans la galerie', onPress: () => handlePhotoSelection(1) },
                        { text: 'Supprimer la photo', onPress: () => handlePhotoSelection(2), style: 'destructive' },
                        { text: 'Annuler', style: 'cancel' }
                    ]
                );
            }
        }
    };

    // Nouvelle fonction pour le web
    const handleWebPhotoSelection = () => {
        Alert.alert(
            'Changer la photo de profil',
            'Choisissez une option',
            [
                { text: 'Choisir une photo', onPress: () => triggerWebFileInput() },
                { text: 'Supprimer la photo', onPress: () => removePhoto(), style: 'destructive' },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    const triggerWebFileInput = () => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (event: any) => {
                const file = event.target.files?.[0];
                if (file) {
                    handleWebFileSelected(file);
                }
            };
            input.click();
        }
    };

    const handleWebFileSelected = async (file: any) => {
        try {
            setIsUpdatingPhoto(true);

            if (!employee) return;

            console.log('📤 Upload de la photo de profil (Web)...');

            // Créer le FormData directement avec le fichier
            const formData = new FormData();
            formData.append('photo', file, file.name);

            const response = await employeeService.updateProfilePhoto(employee.id, formData);

            if (response.success && response.data.photoPath) {
                setEmployee(prev => prev ? {
                    ...prev,
                    photo: response.data.photoPath
                } : null);

                Alert.alert('Succès', 'Photo de profil mise à jour avec succès');
                console.log('✅ Photo de profil mise à jour');
            } else {
                Alert.alert('Erreur', response.message || 'Impossible de mettre à jour la photo');
                console.log('❌ Erreur mise à jour photo:', response.message);
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'upload de la photo (Web):', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour de la photo');
        } finally {
            setIsUpdatingPhoto(false);
        }
    };

    const handlePhotoSelection = async (index: number) => {
        switch (index) {
            case 0: // Prendre une photo
                await takePhoto();
                break;
            case 1: // Choisir dans la galerie
                await pickImageFromGallery();
                break;
            case 2: // Supprimer la photo
                await removePhoto();
                break;
            default:
                break;
        }
    };

    const takePhoto = async () => {
        try {
            // Demander la permission d'accès à la caméra
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission requise', 'L\'accès à la caméra est nécessaire pour prendre une photo.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await processAndUploadPhoto(result.assets[0]);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la prise de photo:', error);
            Alert.alert('Erreur', 'Impossible de prendre la photo');
        }
    };

    const pickImageFromGallery = async () => {
        try {
            // Demander la permission d'accès à la galerie
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission requise', 'L\'accès à la galerie est nécessaire pour choisir une photo.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await processAndUploadPhoto(result.assets[0]);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la sélection d\'image:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
        }
    };

    const processAndUploadPhoto = async (imageAsset: any) => {
        try {
            setIsUpdatingPhoto(true);

            // Redimensionner l'image pour optimiser l'upload
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                imageAsset.uri,
                [{ resize: { width: 300, height: 300 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );

            if (!employee) return;

            console.log('📤 Upload de la photo de profil...');

            // Créer le FormData avec la méthode du service
            const formData = employeeService.createPhotoFormData(manipulatedImage.uri);

            // Appeler le service pour mettre à jour la photo
            const response = await employeeService.updateProfilePhoto(employee.id, formData);

            if (response.success && response.data.photoPath) {
                // Mettre à jour l'employé avec la nouvelle photo
                setEmployee(prev => prev ? {
                    ...prev,
                    photo: response.data.photoPath
                } : null);

                Alert.alert('Succès', 'Photo de profil mise à jour avec succès');
                console.log('✅ Photo de profil mise à jour');
            } else {
                Alert.alert('Erreur', response.message || 'Impossible de mettre à jour la photo');
                console.log('❌ Erreur mise à jour photo:', response.message);
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'upload de la photo:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour de la photo');
        } finally {
            setIsUpdatingPhoto(false);
        }
    };

    const removePhoto = async () => {
        try {
            if (!employee) return;

            setIsUpdatingPhoto(true);
            console.log('🗑️ Suppression de la photo de profil...');

            const response = await employeeService.removeProfilePhoto(employee.id);

            if (response.success) {
                // Mettre à jour l'employé en supprimant la photo
                setEmployee(prev => prev ? {
                    ...prev,
                    photo: undefined // Utiliser undefined au lieu de null
                } : null);

                Alert.alert('Succès', 'Photo de profil supprimée');
                console.log('✅ Photo de profil supprimée');
            } else {
                Alert.alert('Erreur', response.message || 'Impossible de supprimer la photo');
                console.log('❌ Erreur suppression photo:', response.message);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de la photo:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression');
        } finally {
            setIsUpdatingPhoto(false);
        }
    };

    const handleUpdateContact = async (contactData: any) => {
        try {
            console.log('📝 Mise à jour des contacts:', contactData);

            if (!employee) return;

            const response = await employeeService.updateContactInfo(employee.id, contactData);

            if (response.success) {
                setEmployee(response.data);
                setShowContactModal(false);
                Alert.alert('Succès', 'Informations de contact mises à jour');
                console.log('✅ Contacts mis à jour');
            } else {
                Alert.alert('Erreur', response.message || 'Impossible de mettre à jour');
                console.log('❌ Erreur mise à jour contacts:', response.message);
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour contacts:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnecter',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🚪 === DÉCONNEXION DEPUIS PROFILE ===');
                            await logout();
                            console.log('✅ Déconnexion terminée via contexte');
                        } catch (error) {
                            console.error('❌ Erreur déconnexion:', error);
                        }
                    }
                },
            ]
        );
    };

    const getStatusInfo = () => {
        if (!employee) return { color: Colors.textMuted, label: 'Inconnu' };

        const status = employee.statut;
        return {
            color: StyleUtils.getStatusColor(status),
            label: typeof status === 'boolean' ?
                (status ? 'Actif' : 'Inactif') :
                (status || 'Inconnu')
        };
    };

    const getUserInitials = () => {
        if (!employee) return 'U';
        const firstName = employee.prenom || '';
        const lastName = employee.nom || '';
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
    };

    // Fonction pour obtenir l'URL complète de la photo
    const getPhotoUrl = () => {
        if (!employee?.photo) return null;

        // Utiliser la méthode du service pour construire l'URL
        return employeeService.getEmployeePhotoUrl(employee.photo);
    };

    if (isLoading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement du profil...</Text>
            </View>
        );
    }

    if (!employee) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="person-outline" size={64} color={Colors.textMuted} />
                <Text style={styles.errorText}>Impossible de charger le profil</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
                    <Text style={styles.retryText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusInfo = getStatusInfo();
    const photoUrl = getPhotoUrl();

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* 🎨 HEADER AVEC GRADIENT BLEU (selon la charte) */}
                <LinearGradient colors={Gradients.primary} style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.surface} />
                    </TouchableOpacity>

                    {/* 🎨 HEADER PROFIL UNIFORME AVEC CHANGEMENT DE PHOTO */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <TouchableOpacity
                                onPress={handleChangePhoto}
                                disabled={isUpdatingPhoto}
                                style={styles.avatarTouchable}
                            >
                                {photoUrl ? (
                                    <Image source={{ uri: photoUrl }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <LinearGradient
                                            colors={[Colors.secondary, Colors.secondaryLight]}
                                            style={styles.avatarGradient}
                                        >
                                            <Text style={styles.avatarText}>{getUserInitials()}</Text>
                                        </LinearGradient>
                                    </View>
                                )}

                                {/* Overlay avec icône caméra */}
                                <View style={styles.cameraOverlay}>
                                    {isUpdatingPhoto ? (
                                        <View style={styles.loadingIndicator}>
                                            <View style={styles.spinner} />
                                        </View>
                                    ) : (
                                        <Ionicons name="camera" size={20} color={Colors.surface} />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color }]} />
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>
                                {employee.prenom} {employee.nom}
                            </Text>
                            <Text style={styles.userMatricule}>{employee.matricule}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                                <Text style={styles.statusText}>{statusInfo.label}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* 🎨 INFORMATIONS PROFESSIONNELLES UNIFORMES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations professionnelles</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Poste</Text>
                                <Text style={styles.infoValue}>
                                    {employee.poste?.nom || 'Non défini'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="business-outline" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Service</Text>
                                <Text style={styles.infoValue}>
                                    {employee.service?.nom || 'Non assigné'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Date d'entrée</Text>
                                <Text style={styles.infoValue}>
                                    {employee.dateEntree ?
                                        new Date(employee.dateEntree).toLocaleDateString('fr-FR') :
                                        'Non définie'
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 🎨 INFORMATIONS DE CONTACT UNIFORMES */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Informations de contact</Text>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => setShowContactModal(true)}
                        >
                            <Ionicons name="pencil" size={16} color={Colors.primary} />
                            <Text style={styles.editButtonText}>Modifier</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>
                                    {employee.contact?.email || 'Non défini'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Téléphone mobile</Text>
                                <Text style={styles.infoValue}>
                                    {employee.contact?.telephoneMobile || 'Non défini'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="call-outline" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Téléphone interne</Text>
                                <Text style={styles.infoValue}>
                                    {employee.contact?.telephoneInterne || 'Non défini'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="location-outline" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Adresse en entreprise</Text>
                                <Text style={styles.infoValue}>
                                    {employee.contact?.adresseEnEntreprise || 'Non définie'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 🎨 ACTIONS UNIFORMES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('ChangePassword')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: Colors.primarySoft }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.actionText}>Changer le mot de passe</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <View style={[styles.actionIcon, { backgroundColor: Colors.primarySoft }]}>
                            <Ionicons name="settings-outline" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.actionText}>Paramètres</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: StyleUtils.withOpacity(Colors.error, 0.1) }]}>
                            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                        </View>
                        <Text style={[styles.actionText, styles.logoutText]}>Se déconnecter</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal de modification des contacts */}
            <ContactEditModal
                visible={showContactModal}
                employee={employee}
                onClose={() => setShowContactModal(false)}
                onSave={handleUpdateContact}
            />
        </View>
    );
}

// =============================================================================
// 🎨 STYLES AVEC CHARTE GRAPHIQUE UNIFORME
// =============================================================================

const { width } = Dimensions.get('window');

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
        marginTop: Spacing.lg,
    },

    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.huge,
    },

    errorText: {
        ...Typography.h6,
        color: Colors.textMuted,
        marginTop: Spacing.lg,
        textAlign: 'center',
    },

    retryButton: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
    },

    retryText: {
        ...Typography.body,
        color: Colors.surface,
        fontWeight: '600',
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: Spacing.lg,
    },

    // 🎨 HEADER UNIFORME
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 50,
        paddingBottom: Spacing.xxxl,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },

    // 🎨 HEADER PROFIL UNIFORME AVEC PHOTO MODIFIABLE
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    avatarContainer: {
        position: 'relative',
        marginRight: Spacing.lg,
    },

    avatarTouchable: {
        position: 'relative',
    },

    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: Colors.surface,
    },

    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: Colors.surface,
    },

    avatarGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarText: {
        ...Typography.h4,
        color: Colors.surface,
        fontWeight: '700',
    },

    // 🎨 OVERLAY CAMÉRA POUR CHANGEMENT DE PHOTO
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.surface,
    },

    loadingIndicator: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    spinner: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.surface,
        borderTopColor: 'transparent',
        // Animation sera gérée par Animated en production
    },

    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.surface,
    },

    profileInfo: {
        flex: 1,
    },

    userName: {
        ...Typography.h4,
        color: Colors.surface,
        marginBottom: 4,
    },

    userMatricule: {
        ...Typography.body,
        color: StyleUtils.withOpacity(Colors.surface, 0.8),
        marginBottom: Spacing.sm,
    },

    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.lg,
    },

    statusText: {
        ...Typography.caption,
        color: Colors.surface,
        fontWeight: '600',
    },

    // Sections
    section: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },

    sectionTitle: {
        ...Typography.h6,
        color: Colors.textPrimary,
    },

    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    editButtonText: {
        ...Typography.bodySmall,
        color: Colors.primary,
        fontWeight: '500',
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
        backgroundColor: Colors.primarySoft,
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

    // 🎨 BOUTONS D'ACTION UNIFORMES
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
        ...StyleUtils.getUniformShadow('low'),
    },

    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    actionText: {
        flex: 1,
        ...Typography.body,
        color: Colors.textPrimary,
        fontWeight: '500',
    },

    logoutButton: {
        marginTop: Spacing.md,
    },

    logoutText: {
        color: Colors.error,
    },
});

// =============================================================================
// 🎨 STYLES MODAL UNIFORMES
// =============================================================================

const modalStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    // 🎨 HEADER MODAL UNIFORME
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: 50,
        paddingBottom: Spacing.md,
    },

    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalTitle: {
        ...Typography.h6,
        color: Colors.surface,
    },

    saveButton: {
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
    },

    saveButtonText: {
        ...Typography.bodySmall,
        color: Colors.surface,
        fontWeight: '600',
    },

    modalContent: {
        flex: 1,
        padding: Spacing.lg,
    },

    inputGroup: {
        marginBottom: Spacing.lg,
    },

    inputLabel: {
        ...Typography.bodySmall,
        fontWeight: '500',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    inputIcon: {
        marginRight: Spacing.md,
    },

    input: {
        flex: 1,
        ...Typography.body,
        color: Colors.textPrimary,
    },

    inputMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
});