import type { Document } from "../api/documents.api";

interface Props {
    documents: Document[];
    searchAll: boolean;
    selectedDocumentIds: string[];
    onSearchAllChange: (searchAll: boolean) => void;
    onToggleDocument: (documentId: string) => void;
    onClearSelection: () => void;
}

export default function DocumentSelector({
    documents,
    searchAll,
    selectedDocumentIds,
    onSearchAllChange,
    onToggleDocument,
    onClearSelection,
}: Props) {

    return (
        <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">

            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="font-semibold text-white">Search scope</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Choose which PDFs the assistant can search.
                    </p>
                </div>
                {!searchAll && selectedDocumentIds.length > 0 && (
                    <button
                        type="button"
                        onClick={onClearSelection}
                        className="shrink-0 text-xs font-medium text-blue-300 hover:text-blue-200"
                    >
                        Clear Selection
                    </button>
                )}
            </div>

            <div className="grid gap-2 text-sm text-slate-200">

                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-700/60">

                    <input
                        type="radio"
                        name="search-scope"
                        checked={searchAll}
                        onChange={() => onSearchAllChange(true)}
                        className="accent-blue-500"
                    />

                    All Documents

                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-700/60">

                    <input
                        type="radio"
                        name="search-scope"
                        checked={!searchAll}
                        onChange={() => onSearchAllChange(false)}
                        className="accent-blue-500"
                    />

                    Selected Documents

                </label>

            </div>

            {!searchAll && (

                <div className="max-h-40 space-y-2 overflow-y-auto border-t border-slate-700 pt-2">

                    {documents.length > 0 ? documents.map((doc) => (

                        <label
                            key={doc.document_id}
                            className="flex cursor-pointer items-center gap-2 text-xs text-slate-300"
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
                        <p className="text-xs text-slate-500">No documents available.</p>
                    )}

                </div>

            )}

        </div>
    );
}
