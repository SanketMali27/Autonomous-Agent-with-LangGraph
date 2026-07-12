import { useEffect } from "react";
import { useDocumentStore } from "../store/documentStore";

export default function Sidebar() {
    // READ STATE FROM ZUSTAND
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


    // GET ACTIONS FROM ZUSTAND
    const fetchDocuments = useDocumentStore(
        (state) => state.fetchDocuments
    );

    const selectDocument = useDocumentStore(
        (state) => state.selectDocument
    );

    const deleteDocument = useDocumentStore(
        (state) => state.deleteDocument
    );


    // RUN WHEN SIDEBAR FIRST MOUNTS
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);


    return (
        <aside>
            <h2>Documents</h2>

            {loading && <p>Loading...</p>}

            {error && <p>{error}</p>}

            {documents.map((document) => (
                <div key={document.document_id}>

                    <button
                        onClick={() => selectDocument(document)}
                    >
                        {document.document_name}
                    </button>

                    <button
                        onClick={() =>
                            deleteDocument(document.document_id)
                        }
                    >
                        Delete
                    </button>

                </div>
            ))}

            {selectedDocument && (
                <p>
                    Selected: {selectedDocument.document_name}
                </p>
            )}
        </aside>
    );
}