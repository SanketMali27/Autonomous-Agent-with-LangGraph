import { create } from "zustand";

import {
    getDocuments,
    uploadDocument as uploadDocumentApi,
    deleteDocument as deleteDocumentApi,
    type Document,
} from "../api/documents.api";
import { getApiErrorMessage } from "../lib/apiError";


interface DocumentStore {
    documents: Document[];

    selectedDocumentIds: string[];

    setDocuments: (docs: Document[]) => void;

    toggleDocument: (id: string) => void;
    loading: boolean;
    error: string | null;

    fetchDocuments: () => Promise<void>;
    uploadDocument: (file: File) => Promise<void>;
    deleteDocument: (documentId: string) => Promise<void>;

    clearSelection: () => void;
}


export const useDocumentStore = create<DocumentStore>((set) => ({


    documents: [],

    selectedDocumentIds: [],


    loading: false,
    error: null,

    setDocuments: (docs) =>
        set({
            documents: docs,
        }),

    toggleDocument: (id) =>
        set((state) => {
            const exists = state.selectedDocumentIds.includes(id);

            return {
                selectedDocumentIds: exists
                    ? state.selectedDocumentIds.filter((x) => x !== id)
                    : [...state.selectedDocumentIds, id],
            };
        }),

    fetchDocuments: async () => {
        try {
            set({
                loading: true,
                error: null,
            });

            const documents = await getDocuments();

            set({
                documents,
                loading: false,
            });

        } catch (error) {
            set({
                error: getApiErrorMessage(error, "Failed to load documents."),
                loading: false,
            });
        }
    },


    uploadDocument: async (file: File) => {
        try {
            set({
                loading: true,
                error: null,
            });

            await uploadDocumentApi(file);

            const documents = await getDocuments();

            set({
                documents,
                loading: false,
            });

        } catch (error) {
            set({
                error: getApiErrorMessage(error, "Failed to upload document."),
                loading: false,
            });
        }
    },


    deleteDocument: async (documentId: string) => {
        try {
            set({
                loading: true,
                error: null,
            });

            await deleteDocumentApi(documentId);

            set((state) => ({
                documents: state.documents.filter(
                    (document) =>
                        document.document_id !== documentId
                ),

                selectedDocumentIds: state.selectedDocumentIds.filter(
                    (id) => id !== documentId
                ),

                loading: false,
            }));

        } catch (error) {
            set({
                error: getApiErrorMessage(
                    error,
                    "Failed to delete document."
                ),
                loading: false,
            });
        }
    },

    clearSelection: () => set({ selectedDocumentIds: [] }),
}));
