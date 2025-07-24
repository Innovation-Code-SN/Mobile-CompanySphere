// DocumentViewerScreen.tsx - Visualiseur de documents intégré dans l'app
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Alert,
    ScrollView,
    Dimensions,
    Image,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { documentService, Document } from '../../services/documentService';

interface DocumentViewerScreenProps {
    visible: boolean;
    document: Document | null;
    onClose: () => void;
    onDownload?: (document: Document) => void;
    onShare?: (document: Document) => void;
}

const DocumentViewerScreen: React.FC<DocumentViewerScreenProps> = ({
    visible,
    document,
    onClose,
    onDownload,
    onShare
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [fileUri, setFileUri] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [webViewError, setWebViewError] = useState(false);

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    useEffect(() => {
        if (document && visible) {
            loadDocument();
        }
        return () => {
            // Cleanup: supprimer le fichier temporaire si nécessaire
            if (fileUri && fileUri.includes('DocumentViewerCache')) {
                FileSystem.deleteAsync(fileUri, { idempotent: true });
            }
        };
    }, [document, visible]);

    const loadDocument = async () => {
        if (!document) return;

        setIsLoading(true);
        setError(null);
        setWebViewError(false);

        try {
            const blob = await documentService.downloadDocument(document.id);

            // Créer un nom de fichier sécurisé pour le cache
            const fileName = `DocumentViewerCache_${document.id}_${document.nom.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const cachedFileUri = `${FileSystem.cacheDirectory}${fileName}`;

            // Convertir le blob en base64 et l'écrire
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64data = (reader.result as string).split(',')[1];

                    await FileSystem.writeAsStringAsync(cachedFileUri, base64data, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    setFileUri(cachedFileUri);
                } catch (writeError) {
                    setError('Erreur lors de la préparation du document');
                } finally {
                    setIsLoading(false);
                }
            };

            reader.onerror = () => {
                setError('Erreur lors de la lecture du document');
                setIsLoading(false);
            };

            reader.readAsDataURL(blob);

        } catch (error: any) {
            setError('Impossible de charger le document');
            setIsLoading(false);
        }
    };

    const getDocumentType = (contentType: string) => {
        if (contentType.includes('pdf')) return 'pdf';
        if (contentType.includes('image')) return 'image';
        if (contentType.includes('text')) return 'text';
        if (contentType.includes('video')) return 'video';
        if (contentType.includes('audio')) return 'audio';
        return 'other';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const renderDocumentContent = () => {
        if (!document || !fileUri) return null;

        const documentType = getDocumentType(document.contentType);

        switch (documentType) {
            case 'image':
                return (
                    <ScrollView
                        style={styles.contentContainer}
                        contentContainerStyle={styles.imageContainer}
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    >
                        <Image
                            source={{ uri: fileUri }}
                            style={[styles.image, { maxWidth: screenWidth - 40, maxHeight: screenHeight - 200 }]}
                            resizeMode="contain"
                            onLoadStart={() => setIsLoading(true)}
                            onLoadEnd={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setError('Impossible d\'afficher l\'image');
                            }}
                        />
                    </ScrollView>
                );

            case 'pdf':
            case 'text':
            default:
                // Pour PDF et autres documents, utiliser WebView
                const webViewSource = documentType === 'pdf'
                    ? { uri: `https://docs.google.com/viewer?url=${encodeURIComponent(fileUri)}&embedded=true` }
                    : { uri: fileUri };

                return (
                    <View style={styles.contentContainer}>
                        <WebView
                            source={webViewSource}
                            style={styles.webView}
                            onLoadStart={() => setIsLoading(true)}
                            onLoadEnd={() => setIsLoading(false)}
                            onError={() => {
                                setWebViewError(true);
                                setIsLoading(false);
                            }}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            renderLoading={() => (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#1E88E5" />
                                    <Text style={styles.loadingText}>Chargement du document...</Text>
                                </View>
                            )}
                        />

                        {webViewError && (
                            <View style={styles.webViewErrorContainer}>
                                <Ionicons name="warning-outline" size={48} color="#FF9800" />
                                <Text style={styles.webViewErrorTitle}>Visualisation non disponible</Text>
                                <Text style={styles.webViewErrorText}>
                                    Ce type de document ne peut pas être visualisé directement.
                                </Text>
                                <TouchableOpacity
                                    style={styles.downloadButton}
                                    onPress={() => onDownload && onDownload(document)}
                                >
                                    <Ionicons name="download-outline" size={20} color="white" />
                                    <Text style={styles.downloadButtonText}>Télécharger pour ouvrir</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                );
        }
    };

    if (!document) return null;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />

                {/* En-tête */}
                <LinearGradient colors={['#1E88E5', '#1976D2']} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>

                        <View style={styles.headerInfo}>
                            <Text style={styles.headerTitle} numberOfLines={1}>
                                {document.nom}
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                {formatFileSize(document.size)} • {document.contentType}
                            </Text>
                        </View>

                        <View style={styles.headerActions}>
                            {onDownload && (
                                <TouchableOpacity
                                    onPress={() => onDownload(document)}
                                    style={styles.headerButton}
                                >
                                    <Ionicons name="download-outline" size={24} color="white" />
                                </TouchableOpacity>
                            )}
                            {onShare && (
                                <TouchableOpacity
                                    onPress={() => onShare(document)}
                                    style={styles.headerButton}
                                >
                                    <Ionicons name="share-outline" size={24} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </LinearGradient>

                {/* Contenu du document */}
                <View style={styles.documentContainer}>
                    {isLoading && !webViewError && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#1E88E5" />
                            <Text style={styles.loadingText}>Chargement du document...</Text>
                        </View>
                    )}

                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="document-outline" size={64} color="#ccc" />
                            <Text style={styles.errorTitle}>Impossible de charger le document</Text>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={loadDocument}
                            >
                                <Text style={styles.retryButtonText}>Réessayer</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!isLoading && !error && renderDocumentContent()}
                </View>
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
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        minHeight: 60,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    documentContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        flex: 1,
    },
    imageContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    image: {
        borderRadius: 8,
    },
    webView: {
        flex: 1,
        backgroundColor: 'white',
    },
    webViewErrorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    webViewErrorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    webViewErrorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E88E5',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    downloadButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'white',
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    retryButton: {
        backgroundColor: '#1E88E5',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default DocumentViewerScreen;