import { FileText, FolderOpen } from "lucide-react";
import type { Document } from "../../api/documents.api";
import DocumentItem from "./DocumentItem";

interface Props {
    documents: Document[];
    selectedDocumentIds: string[];
    onToggleDocument: (documentId: string) => void;
    onClearSelection: () => void;
    onDelete: (id: string) => void;
}

export default function DocumentList({
    documents,
    selectedDocumentIds,
    onToggleDocument,
    onClearSelection,
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

            <div className="mb-2 flex min-h-8 items-center justify-between gap-2 px-2">
                <p className="text-xs font-medium text-slate-400" aria-live="polite">
                    {selectedDocumentIds.length === 0
                        ? "All documents"
                        : `${selectedDocumentIds.length} document${selectedDocumentIds.length === 1 ? "" : "s"} selected`}
                </p>
                {selectedDocumentIds.length > 0 && (
                    <button type="button" onClick={onClearSelection} className="rounded-md px-2 py-1 text-xs font-medium text-blue-300 transition hover:bg-blue-500/10 hover:text-blue-200 focus-visible:outline">
                        Clear selection
                    </button>
                )}
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                {documents.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/25 p-4 text-center">
                        <FileText size={20} className="mx-auto text-slate-500" />
                        <h3 className="mt-2 text-sm font-medium text-slate-300">No documents yet</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">Upload a PDF to start researching your documents.</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <DocumentItem
                            key={doc.document_id}
                            name={doc.document_name}
                            selected={selectedDocumentIds.includes(doc.document_id)}
                            onClick={() => onToggleDocument(doc.document_id)}
                            onDelete={() => onDelete(doc.document_id)}
                        />
                    ))
                )}
            </div>

        </div>
    );
}
