import type { Document } from "../api/documents.api";

interface Props {
    documents: Document[];
    selectedDocumentIds: string[];
    onToggleDocument: (documentId: string) => void;
    onClearSelection: () => void;
}

export default function DocumentSelector({
    documents,
    selectedDocumentIds,
    onToggleDocument,
    onClearSelection,
}: Props) {

    return (
        <div className="space-y-2 rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-lg shadow-black/10">

            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-white">Search scope</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Choose which PDFs the assistant can search.</p>
                </div>
                {selectedDocumentIds.length > 0 && (
                    <button
                        type="button"
                        onClick={onClearSelection}
                        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-blue-300 transition hover:bg-blue-500/10 hover:text-blue-200"
                    >
                        Clear selection
                    </button>
                )}
            </div>

            <p className="text-xs font-medium text-slate-300" aria-live="polite">
                {selectedDocumentIds.length === 0
                    ? "All documents"
                    : `${selectedDocumentIds.length} document${selectedDocumentIds.length === 1 ? "" : "s"} selected`}
            </p>

            <div className="max-h-36 space-y-1.5 overflow-y-auto border-t border-slate-700 pt-2">

                    {documents.length > 0 ? documents.map((doc) => (

                        <label
                            key={doc.document_id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-xs text-slate-300 hover:bg-white/5"
                        >

                            <input
                                type="checkbox"
                                checked={selectedDocumentIds.includes(doc.document_id)}
                                onChange={() => onToggleDocument(doc.document_id)}
                                className="accent-blue-500"
                            />

                            {doc.document_name}

                        </label>

                    )) : (
                        <p className="text-xs text-slate-500">Upload a PDF to start researching your documents.</p>
                    )}

                </div>

        </div>
    );
}
