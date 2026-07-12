import { useEffect } from "react";
import { useDocumentStore } from "../store/documentStore";
import FileUpload from "./FileUpload";

export default function Sidebar() {
    const documents = useDocumentStore(
        (state) => state.documents
    );

    const selectedDocument = useDocumentStore(
        (state) => state.selectedDocument
    );

    const loading = useDocumentStore(
        (state) => state.loading
    );

    const error = useDocumentStore(
        (state) => state.error
    );

    const fetchDocuments = useDocumentStore(
        (state) => state.fetchDocuments
    );

    const selectDocument = useDocumentStore(
        (state) => state.selectDocument
    );

    const deleteDocument = useDocumentStore(
        (state) => state.deleteDocument
    );

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    return (
        <aside>
            <h2>Documents</h2>

            <FileUpload />

            {error && <p>{error}</p>}

            <div>
                {documents.map((document) => (
                    <div key={document.document_id}>

                        <button
                            onClick={() =>
                                selectDocument(document)
                            }
                        >
                            {document.document_name}
                        </button>

                        <button
                            onClick={() =>
                                deleteDocument(
                                    document.document_id
                                )
                            }
                        >
                            Delete
                        </button>

                    </div>
                ))}
            </div>

            {selectedDocument && (
                <p>
                    Selected: {selectedDocument.document_name}
                </p>
            )}

            {loading && <p>Processing...</p>}
        </aside>
    );
}