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
            <div className="mb-3 flex items-center justify-between px-2">
                <div>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                        <FolderOpen size={16} className="text-blue-300" />
                        Documents
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {documents.length} {documents.length === 1 ? "document" : "documents"}
                    </p>
                </div>
            </div>

            <div className="mb-3 rounded-xl border border-white/8 bg-slate-900/35 p-1">
                <div className="grid grid-cols-2 gap-1">
                    <button
                        type="button"
                        onClick={() => onSearchAllChange(true)}
                        className={`rounded-lg px-2 py-1.5 text-xs font-medium transition ${searchAll ? "bg-blue-500/15 text-blue-200" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"}`}
                    >
                        All documents
                    </button>
                    <button
                        type="button"
                        onClick={() => onSearchAllChange(false)}
                        className={`rounded-lg px-2 py-1.5 text-xs font-medium transition ${!searchAll ? "bg-blue-500/15 text-blue-200" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"}`}
                    >
                        Selected
                    </button>
                </div>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                {documents.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/25 p-4 text-center">
                        <FileText size={20} className="mx-auto text-slate-500" />
                        <h3 className="mt-2 text-sm font-medium text-slate-300">No documents yet</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">Upload a PDF above to search it here.</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <DocumentItem
                            key={doc.document_id}
                            name={doc.document_name}
                            selected={!searchAll && selectedDocumentIds.includes(doc.document_id)}
                            onClick={() => {
                                if (searchAll) onSearchAllChange(false);
                                onToggleDocument(doc.document_id);
                            }}
                            onDelete={() => onDelete(doc.document_id)}
                        />
                    ))
                )}
            </div>

            {!searchAll && documents.length > 0 && selectedDocumentIds.length === 0 && (
                <p className="mt-2 px-2 text-[11px] text-amber-300/80">Select at least one document to use this scope.</p>
            )}
        </div>
    );
}
