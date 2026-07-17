import DocumentItem from "./DocumentItem";
import type { Document } from "../../api/documents.api";


interface Props {
    documents: Document[];

    selectedDocument: Document | null;

    onSelect: (document: Document) => void;

    onDelete: (id: string) => void;
}

export default function DocumentList({
    documents,
    selectedDocument,
    onSelect,
    onDelete,
}: Props) {
    return (
        <div className="flex-1 overflow-y-auto p-4">
            <h2 className="mb-3 font-semibold">
                Documents
            </h2>

            <div className="space-y-2">
                {documents.map((doc) => (
                    <DocumentItem
                        key={doc.document_id}
                        name={doc.document_name}
                        selected={selectedDocument === doc}
                        onClick={() =>
                            onSelect(doc)
                        }
                        onDelete={() =>
                            onDelete(doc.document_id)
                        }
                    />
                ))}
            </div>
        </div>
    );
}