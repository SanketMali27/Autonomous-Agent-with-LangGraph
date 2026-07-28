import type { Document } from "../../api/documents.api";
import DocumentSelector from "../DocumentSelector";
import DocumentList from "./DocumentList";
import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import UploadSection from "./UploadSection";
import ConversationList from "./ConversationList"

interface Props {
    documents: Document[];
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
    onDelete,
    onLogout,
}: Props) {
    return (
        <aside className="relative z-10 hidden h-screen w-80 shrink-0 flex-col border-r border-white/10 bg-slate-900/70 backdrop-blur-xl lg:flex">
            <div className="border-b border-white/10 px-4 py-4">
                <SidebarHeader onNewChat={onNewChat} />
            </div>

            {/* Scrollable area */}
            <div className="flex-1 overflow-y-auto">
                <div className="border-b border-white/10 px-2 py-2">
                    <ConversationList />
                </div>

                <div className="border-b border-white/10 px-4 py-4">
                    <UploadSection
                        onUpload={onUpload}
                        loading={loading}
                    />

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

                <div className="px-2 py-2">
                    <DocumentList
                        documents={documents}
                        searchAll={searchAll}
                        selectedDocumentIds={selectedDocumentIds}
                        onSearchAllChange={onSearchAllChange}
                        onToggleDocument={onToggleDocument}
                        onDelete={onDelete}
                    />
                </div>
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
