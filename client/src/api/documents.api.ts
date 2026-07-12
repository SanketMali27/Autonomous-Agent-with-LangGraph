import api from "./axios";

export interface Document {
    document_id: string;
    document_name: string;
    uploaded_at: string;
}

export const getDocuments = async (): Promise<Document[]> => {
    const response = await api.get("/documents");
    return response.data.documents;
};

export const uploadDocument = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post("/upload", formData);

    return response.data;
};

export const deleteDocument = async (documentId: string) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
};