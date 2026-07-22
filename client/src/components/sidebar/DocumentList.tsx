import { FileText, FolderOpen } from "lucide-react";
import type { Document } from "../../api/documents.api";
import DocumentItem from "./DocumentItem";

interface Props {
    documents: Document[];
    searchAll: boolean;
    selectedDocumentIds: string[];
    onSearchAllChange: (searchAll: boolean) => void;
    onToggleDocument: (documentId: string) => void;
    onDelete: (id: string) => void;
}

export default function DocumentList({
    documents,
    searchAll,
    selectedDocumentIds,
    onSearchAllChange,
    onToggleDocument,
    onDelete,
}: Props) {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between px-2">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                        <FolderOpen
                            size={18}
                            className="text-blue-300"
                        />
                        Documents
                    </h2>

                    <p className="text-xs text-slate-400">
                        {documents.length}{" "}
                        {documents.length === 1
                            ? "document"
                            : "documents"}
                    </p>
                </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {documents.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-slate-600 bg-slate-800/40 p-6 text-center">
                        <div className="mb-3 flex justify-center">
                            <div className="rounded-2xl bg-slate-700/70 p-4 text-slate-300">
                                <FileText size={28} />
                            </div>
                        </div>

                        <h3 className="font-semibold text-white">
                            No documents yet
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Upload your first PDF to
                            start chatting.
                        </p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <DocumentItem
                            key={doc.document_id}
                            name={doc.document_name}
                            selected={
                                !searchAll &&
                                selectedDocumentIds.includes(
                                    doc.document_id
                                )
                            }
                            onClick={() => {
                                if (searchAll) {
                                    onSearchAllChange(
                                        false
                                    );
                                }

                                onToggleDocument(
                                    doc.document_id
                                );
                            }}
                            onDelete={() =>
                                onDelete(
                                    doc.document_id
                                )
                            }
                        />
                    ))
                )}
            </div>
        </div>
    );
}
