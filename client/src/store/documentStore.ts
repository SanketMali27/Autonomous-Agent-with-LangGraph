import { create } from "zustand";

import {
    getDocuments,
    uploadDocument as uploadDocumentApi,
    deleteDocument as deleteDocumentApi,
    type Document,
} from "../api/documents.api";


interface DocumentStore {
    documents: Document[];
    selectedDocument: Document | null;

    loading: boolean;
    error: string | null;

    fetchDocuments: () => Promise<void>;
    uploadDocument: (file: File) => Promise<void>;
    deleteDocument: (documentId: string) => Promise<void>;
    selectDocument: (document: Document | null) => void;
}


export const useDocumentStore = create<DocumentStore>((set) => ({

    documents: [],
    selectedDocument: null,

    loading: false,
    error: null,


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

        } catch {
            set({
                error: "Failed to fetch documents",
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

        } catch {
            set({
                error: "Failed to upload document",
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

                loading: false,
            }));

        } catch {
            set({
                error: "Failed to delete document",
                loading: false,
            });
        }
    },


    selectDocument: (document) => {
        set({
            selectedDocument: document,
        });
    },

}));