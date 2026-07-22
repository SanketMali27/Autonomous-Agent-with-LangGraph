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
    selectedDocument: Document | null;
    searchAll: boolean;
    selectedDocumentIds: string[];

    loading: boolean;
    error: string | null;

    fetchDocuments: () => Promise<void>;
    uploadDocument: (file: File) => Promise<void>;
    deleteDocument: (documentId: string) => Promise<void>;
    selectDocument: (document: Document | null) => void;
    setSearchAll: (searchAll: boolean) => void;
    toggleDocument: (documentId: string) => void;
    clearSelection: () => void;
}


export const useDocumentStore = create<DocumentStore>((set) => ({

    documents: [],
    selectedDocument: null,
    searchAll: true,
    selectedDocumentIds: [],

    loading: false,
    error: null,


    fetchDocuments: async () => {
        try {
            set({
                loading: true,
                error: null,
            });

            const documents = await getDocuments();

            set((state) => ({
                documents,
                selectedDocumentIds: state.selectedDocumentIds.filter((id) =>
                    documents.some((document) => document.document_id === id)
                ),
                loading: false,
            }));

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

            set((state) => ({
                documents,
                selectedDocumentIds: state.selectedDocumentIds.filter((id) =>
                    documents.some((document) => document.document_id === id)
                ),
                loading: false,
            }));

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

                selectedDocument:
                    state.selectedDocument?.document_id === documentId
                        ? null
                        : state.selectedDocument,

                selectedDocumentIds: state.selectedDocumentIds.filter(
                    (id) => id !== documentId
                ),

                loading: false,
            }));

        } catch (error) {
            set({
                error: getApiErrorMessage(error, "Failed to delete document."),
                loading: false,
            });
        }
    },


    selectDocument: (document) => {
        set({
            selectedDocument: document,
        });
    },

    setSearchAll: (searchAll) => {
        set({ searchAll });
    },

    toggleDocument: (documentId) => {
        set((state) => ({
            searchAll: false,
            selectedDocumentIds: state.selectedDocumentIds.includes(documentId)
                ? state.selectedDocumentIds.filter((id) => id !== documentId)
                : [...state.selectedDocumentIds, documentId],
        }));
    },

    clearSelection: () => {
        set({ selectedDocumentIds: [] });
    },

}));
