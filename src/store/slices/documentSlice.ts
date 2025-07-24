import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { documentService, Document, Folder } from '../../services/documentService';

export interface DocumentState {
    folders: Folder[];
    documents: Document[];
    currentFolder: Folder | null;
    selectedDocuments: string[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
}

const initialState: DocumentState = {
    folders: [],
    documents: [],
    currentFolder: null,
    selectedDocuments: [],
    isLoading: false,
    error: null,
    searchQuery: '',
};

// Async thunks
export const fetchFolders = createAsyncThunk(
    'documents/fetchFolders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await documentService.getAllFolders();
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Erreur lors du chargement des dossiers');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDocuments = createAsyncThunk(
    'documents/fetchDocuments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await documentService.getAllDocuments();
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Erreur lors du chargement des documents');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const documentSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setCurrentFolder: (state, action: PayloadAction<Folder | null>) => {
            state.currentFolder = action.payload;
        },
        toggleDocumentSelection: (state, action: PayloadAction<string>) => {
            const documentId = action.payload;
            const index = state.selectedDocuments.indexOf(documentId);
            if (index === -1) {
                state.selectedDocuments.push(documentId);
            } else {
                state.selectedDocuments.splice(index, 1);
            }
        },
        clearDocumentSelection: (state) => {
            state.selectedDocuments = [];
        },
        selectAllDocuments: (state, action: PayloadAction<string[]>) => {
            state.selectedDocuments = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        reset: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Fetch folders
        builder
            .addCase(fetchFolders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFolders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.folders = action.payload;
            })
            .addCase(fetchFolders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch documents
        builder
            .addCase(fetchDocuments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.documents = action.payload;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setSearchQuery: setDocumentSearchQuery,
    setCurrentFolder,
    toggleDocumentSelection,
    clearDocumentSelection,
    selectAllDocuments,
    clearError: clearDocumentError,
    reset: resetDocuments,
} = documentSlice.actions;

// Selectors
export const selectFolders = (state: { documents: DocumentState }) => state.documents.folders;
export const selectDocuments = (state: { documents: DocumentState }) => state.documents.documents;
export const selectCurrentFolder = (state: { documents: DocumentState }) => state.documents.currentFolder;
export const selectSelectedDocuments = (state: { documents: DocumentState }) => state.documents.selectedDocuments;
export const selectDocumentsLoading = (state: { documents: DocumentState }) => state.documents.isLoading;
export const selectDocumentsError = (state: { documents: DocumentState }) => state.documents.error;
export const selectDocumentSearchQuery = (state: { documents: DocumentState }) => state.documents.searchQuery;

export default documentSlice.reducer;