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
        <div className="flex h-full flex-col">

            {/* Header */}
            <div className="mb-4 flex items-center justify-between px-2">

                <div>
                    <h2 className="text-lg font-semibold text-white">
                        📚 Documents
                    </h2>

                    <p className="text-xs text-slate-400">
                        {documents.length} {documents.length === 1 ? "Document" : "Documents"}
                    </p>
                </div>

            </div>

            {/* List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">

                {documents.length === 0 ? (

                    <div className="mt-8 rounded-2xl border border-dashed border-slate-600 bg-slate-800/40 p-6 text-center">

                        <div className="mb-3 text-4xl">
                            📄
                        </div>

                        <h3 className="font-semibold text-white">
                            No Documents
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Upload your first PDF to start chatting.
                        </p>

                    </div>

                ) : (

                    documents.map((doc) => (
                        <DocumentItem
                            key={doc.document_id}
                            name={doc.document_name}
                            selected={
                                selectedDocument?.document_id ===
                                doc.document_id
                            }
                            onClick={() => onSelect(doc)}
                            onDelete={() => onDelete(doc.document_id)}
                        />
                    ))

                )}

            </div>

        </div>
    );
}