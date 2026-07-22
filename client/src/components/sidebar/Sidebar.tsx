import SidebarHeader from "./SidebarHeader";
import UploadSection from "./UploadSection";
import DocumentList from "./DocumentList";
import SidebarFooter from "./SidebarFooter";
import DocumentSelector from "../DocumentSelector";
import type { Document } from "../../api/documents.api";

interface Props {
    documents: Document[];

    selectedDocument: Document | null;

    onSelect: (document: Document) => void;
    username?: string;

    onNewChat: () => void;
    onUpload: (file: File) => Promise<void>;
    loading: boolean;
    error: string | null;
    searchAll: boolean;
    selectedDocumentIds: string[];
    onSearchAllChange: (searchAll: boolean) => void;
    onToggleDocument: (documentId: string) => void;
    onClearSelection: () => void;

    onDelete: (id: string) => void;
    onLogout: () => void;
}

export default function Sidebar({
    documents,
    selectedDocument,
    username,
    onNewChat,
    onUpload,
    loading,
    error,
    searchAll,
    selectedDocumentIds,
    onSearchAllChange,
    onToggleDocument,
    onClearSelection,
    onSelect,
    onDelete,
    onLogout,
}: Props) {
    return (
        <aside className="relative z-10 flex h-screen w-72 flex-col border-r border-white/10 bg-slate-900/70 backdrop-blur-xl">

            <div className="border-b border-white/10 px-4 py-4">
                <SidebarHeader onNewChat={onNewChat} />
            </div>

            <div className="border-b border-white/10 px-4 py-4">
                <UploadSection onUpload={onUpload} loading={loading} />
                {error && (
                    <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                        {error}
                    </div>
                )}
            </div>

            <div className="border-b border-white/10 px-4 py-4">
                <DocumentSelector
                    documents={documents}
                    searchAll={searchAll}
                    selectedDocumentIds={selectedDocumentIds}
                    onSearchAllChange={onSearchAllChange}
                    onToggleDocument={onToggleDocument}
                    onClearSelection={onClearSelection}
                />
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
                <DocumentList
                    documents={documents}
                    selectedDocument={selectedDocument}
                    onSelect={onSelect}
                    onDelete={onDelete}
                />
            </div>

            <div className="border-t border-white/10 px-4 py-3">
                <SidebarFooter
                    username={username}
                    onLogout={onLogout}
                />
            </div>

        </aside>
    );
}
