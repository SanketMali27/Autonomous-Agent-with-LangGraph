

import type { Document } from "../../api/documents.api";
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
    selectedDocumentIds: string[];
    onToggleDocument: (documentId: string) => void;
    onClearSelection: () => void;
    onDelete: (id: string) => void;
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({
    documents,
    username,
    onNewChat,
    onUpload,
    loading,
    error,
    selectedDocumentIds,
    onToggleDocument,
    onClearSelection,
    onDelete,
    onLogout,
    isOpen,
    onClose,
}: Props) {
    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
                />
            )}
            <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(88vw,320px)] shrink-0 flex-col border-r border-white/10 bg-[#11182a] shadow-2xl shadow-black/40 transition-transform duration-200 lg:relative lg:z-10 lg:h-screen lg:w-[292px] lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="border-b border-white/8 px-4 py-4">
                <SidebarHeader onNewChat={onNewChat} />
            </div>

            {/* Scrollable area */}
            <div className="flex-1 overflow-y-auto">
                <div className="border-b border-white/8 px-2 py-3">
                    <ConversationList onSelect={onClose} />
                </div>

                <div className="border-b border-white/8 px-3 py-3">
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

                <div className="px-2 py-3">
                    <DocumentList
                        documents={documents}
                        selectedDocumentIds={selectedDocumentIds}
                        onToggleDocument={onToggleDocument}
                        onClearSelection={onClearSelection}
                        onDelete={onDelete}
                    />
                </div>
            </div>

            <div className="border-t border-white/8 px-3 py-3">
                <SidebarFooter
                    username={username}
                    onLogout={onLogout}
                />
            </div>
            </aside>
        </>
    );
}
