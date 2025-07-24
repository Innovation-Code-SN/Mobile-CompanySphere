// FolderDetailScreen.tsx - Écran de détails du dossier avec navigation et documents
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    SafeAreaView,
    StatusBar,
    Share,
    Linking,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { documentService, Folder, Document } from '../../services/documentService';
import DocumentViewerScreen from './DocumentViewerScreen';

interface FolderDetailScreenProps {
    visible: boolean;
    folder: Folder | null;
    onClose: () => void;
    onRefresh?: () => void;
}

interface DocumentCardProps {
    document: Document;
    onView: (document: Document) => void;
    onDownload: (document: Document) => void;
    onShare: (document: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onView, onDownload, onShare }) => {
    const getFileIcon = (contentType: string) => {
        if (contentType.includes('pdf')) return { icon: 'document-text', color: '#F44336' };
        if (contentType.includes('image')) return { icon: 'image', color: '#4CAF50' };
        if (contentType.includes('video')) return { icon: 'videocam', color: '#9C27B0' };
        if (contentType.includes('audio')) return { icon: 'musical-notes', color: '#FF9800' };
        if (contentType.includes('word')) return { icon: 'document', color: '#2196F3' };
        if (contentType.includes('excel') || contentType.includes('spreadsheet'))
            return { icon: 'grid', color: '#4CAF50' };
        if (contentType.includes('powerpoint') || contentType.includes('presentation'))
            return { icon: 'easel', color: '#FF5722' };
        if (contentType.includes('text')) return { icon: 'document-text-outline', color: '#607D8B' };
        return { icon: 'document-outline', color: '#757575' };
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const fileInfo = getFileIcon(document.contentType);

    return (
        <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
                <View style={[styles.documentIcon, { backgroundColor: `${fileInfo.color}15` }]}>
                    <Ionicons name={fileInfo.icon as any} size={24} color={fileInfo.color} />
                </View>
                <View style={styles.documentInfo}>
                    <Text style={styles.documentName} numberOfLines={2}>
                        {document.nom}
                    </Text>
                    <Text style={styles.documentMeta}>
                        {formatFileSize(document.size)} • {formatDate(document.createdAt)}
                    </Text>
                    {document.tags && document.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {document.tags.slice(0, 2).map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                            {document.tags.length > 2 && (
                                <Text style={styles.moreTags}>+{document.tags.length - 2}</Text>
                            )}
                        </View>
                    )}
                </View>
            </View>

            {/* Actions du document */}
            <View style={styles.documentActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => onView(document)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="eye-outline" size={18} color="#1E88E5" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.downloadButton]}
                    onPress={() => onDownload(document)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="download-outline" size={18} color="#4CAF50" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={() => onShare(document)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="share-outline" size={18} color="#FF9800" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

interface SubFolderCardProps {
    folder: Folder;
    onPress: (folder: Folder) => void;
}

const SubFolderCard: React.FC<SubFolderCardProps> = ({ folder, onPress }) => {
    const documentCount = folder.documents?.length || 0;

    return (
        <TouchableOpacity
            style={styles.subFolderCard}
            onPress={() => onPress(folder)}
            activeOpacity={0.7}
        >
            <View style={styles.subFolderIcon}>
                <Ionicons name="folder" size={20} color="#1E88E5" />
            </View>
            <View style={styles.subFolderInfo}>
                <Text style={styles.subFolderName} numberOfLines={1}>
                    {folder.nom}
                </Text>
                <Text style={styles.subFolderCount}>
                    {documentCount} document{documentCount > 1 ? 's' : ''}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>
    );
};

const FolderDetailScreen: React.FC<FolderDetailScreenProps> = ({
    visible,
    folder,
    onClose,
    onRefresh
}) => {
    const [refreshing, setRefreshing] = useState(false);
    const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
    const [navigationStack, setNavigationStack] = useState<Folder[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [showDocumentViewer, setShowDocumentViewer] = useState(false);

    useEffect(() => {
        if (folder && visible) {
            setCurrentFolder(folder);
            setNavigationStack([folder]);
        }
    }, [folder, visible]);

    if (!currentFolder) return null;

    const handleRefresh = async () => {
        setRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        setRefreshing(false);
    };

    const navigateToSubFolder = (subFolder: Folder) => {
        setCurrentFolder(subFolder);
        setNavigationStack([...navigationStack, subFolder]);
    };

    const navigateBack = () => {
        if (navigationStack.length > 1) {
            const newStack = navigationStack.slice(0, -1);
            setNavigationStack(newStack);
            setCurrentFolder(newStack[newStack.length - 1]);
        } else {
            onClose();
        }
    };

    const handleDocumentView = async (document: Document) => {
        // Ouvrir le visualiseur intégré
        setSelectedDocument(document);
        setShowDocumentViewer(true);
    };

    const handleDocumentDownload = async (document: Document, openAfterDownload = false) => {
        try {
            Alert.alert(
                'Téléchargement',
                `Téléchargement de "${document.nom}" en cours...`,
                [{ text: 'OK' }]
            );

            const blob = await documentService.downloadDocument(document.id);

            // Créer un nom de fichier sécurisé
            const fileName = document.nom.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            // Convertir le blob en base64 puis l'écrire
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64data = (reader.result as string).split(',')[1];

                await FileSystem.writeAsStringAsync(fileUri, base64data, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                if (openAfterDownload) {
                    // Ouvrir le fichier avec l'application par défaut
                    try {
                        await Linking.openURL(fileUri);
                    } catch (linkError) {
                        // Si Linking ne fonctionne pas, proposer le partage
                        handleShareFile(fileUri, document.nom);
                    }
                } else {
                    Alert.alert(
                        'Téléchargement terminé',
                        `"${document.nom}" a été téléchargé avec succès.`,
                        [
                            { text: 'OK' },
                            {
                                text: 'Ouvrir',
                                onPress: () => handleShareFile(fileUri, document.nom)
                            }
                        ]
                    );
                }
            };

            reader.readAsDataURL(blob);

        } catch (error: any) {
            Alert.alert('Erreur', 'Impossible de télécharger le document');
            console.error('Erreur téléchargement:', error);
        }
    };

    const handleShareFile = async (fileUri: string, fileName: string) => {
        try {
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                // Utiliser le Share natif de React Native
                await Share.share({
                    url: fileUri,
                    title: fileName,
                }, {
                    dialogTitle: `Partager ${fileName}`
                });
            } else {
                // Sur d'autres plateformes, essayer d'ouvrir avec Linking
                await Linking.openURL(fileUri);
            }
        } catch (error) {
            Alert.alert('Information', 'Fichier téléchargé dans les documents de l\'application');
        }
    };

    const handleDocumentShare = async (document: Document) => {
        try {
            if (Platform.OS === 'web') {
                // Sur web, partager l'URL ou les informations du document
                await Share.share({
                    message: `Document: ${document.nom}`,
                    title: document.nom
                });
            } else {
                // Sur mobile, télécharger puis partager
                const blob = await documentService.downloadDocument(document.id);
                const fileName = document.nom.replace(/[^a-zA-Z0-9.-]/g, '_');
                const fileUri = `${FileSystem.documentDirectory}${fileName}`;

                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];

                    await FileSystem.writeAsStringAsync(fileUri, base64data, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    await handleShareFile(fileUri, document.nom);
                };

                reader.readAsDataURL(blob);
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de partager le document');
        }
    };

    const renderBreadcrumb = () => {
        return (
            <View style={styles.breadcrumb}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.breadcrumbContent}>
                        {navigationStack.map((folderItem, index) => (
                            <View key={folderItem.id} style={styles.breadcrumbItem}>
                                <TouchableOpacity
                                    onPress={() => {
                                        const newStack = navigationStack.slice(0, index + 1);
                                        setNavigationStack(newStack);
                                        setCurrentFolder(folderItem);
                                    }}
                                >
                                    <Text style={[
                                        styles.breadcrumbText,
                                        index === navigationStack.length - 1 && styles.breadcrumbTextActive
                                    ]}>
                                        {folderItem.nom}
                                    </Text>
                                </TouchableOpacity>
                                {index < navigationStack.length - 1 && (
                                    <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
                                )}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />

                {/* En-tête */}
                <LinearGradient colors={['#1E88E5', '#1976D2']} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Documents</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Fil d'ariane */}
                    {renderBreadcrumb()}
                </LinearGradient>

                {/* Contenu */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {/* Sous-dossiers */}
                    {currentFolder.sousDossiers && currentFolder.sousDossiers.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Sous-dossiers ({currentFolder.sousDossiers.length})
                            </Text>
                            {currentFolder.sousDossiers.map((subFolder) => (
                                <SubFolderCard
                                    key={subFolder.id}
                                    folder={subFolder}
                                    onPress={navigateToSubFolder}
                                />
                            ))}
                        </View>
                    )}

                    {/* Documents */}
                    {currentFolder.documents && currentFolder.documents.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Documents ({currentFolder.documents.length})
                            </Text>
                            {currentFolder.documents.map((document) => (
                                <DocumentCard
                                    key={document.id}
                                    document={document}
                                    onView={handleDocumentView}
                                    onDownload={handleDocumentDownload}
                                    onShare={handleDocumentShare}
                                />
                            ))}
                        </View>
                    )}

                    {/* État vide */}
                    {(!currentFolder.documents || currentFolder.documents.length === 0) &&
                        (!currentFolder.sousDossiers || currentFolder.sousDossiers.length === 0) && (
                            <View style={styles.emptyState}>
                                <Ionicons name="folder-open-outline" size={64} color="#ccc" />
                                <Text style={styles.emptyStateText}>Dossier vide</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Ce dossier ne contient aucun document ou sous-dossier
                                </Text>
                            </View>
                        )}
                </ScrollView>

                {/* Visualiseur de documents intégré */}
                <DocumentViewerScreen
                    visible={showDocumentViewer}
                    document={selectedDocument}
                    onClose={() => {
                        setShowDocumentViewer(false);
                        setSelectedDocument(null);
                    }}
                    onDownload={(doc) => {
                        setShowDocumentViewer(false);
                        handleDocumentDownload(doc);
                    }}
                    onShare={(doc) => {
                        setShowDocumentViewer(false);
                        handleDocumentShare(doc);
                    }}
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingBottom: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    breadcrumb: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    breadcrumbContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breadcrumbItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    breadcrumbText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginRight: 8,
    },
    breadcrumbTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    subFolderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    subFolderIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    subFolderInfo: {
        flex: 1,
    },
    subFolderName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    subFolderCount: {
        fontSize: 12,
        color: '#666',
    },
    documentCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    documentHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    documentIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    documentMeta: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    tag: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 4,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 10,
        color: '#1E88E5',
        fontWeight: '600',
    },
    moreTags: {
        fontSize: 10,
        color: '#666',
        fontStyle: 'italic',
    },
    documentActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewButton: {
        backgroundColor: '#E3F2FD',
    },
    downloadButton: {
        backgroundColor: '#E8F5E8',
    },
    shareButton: {
        backgroundColor: '#FFF3E0',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        fontWeight: '600',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
        textAlign: 'center',
    },
});

export default FolderDetailScreen;