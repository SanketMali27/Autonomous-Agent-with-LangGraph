import SidebarHeader from "./SidebarHeader";
import UploadSection from "./UploadSection";
import DocumentList from "./DocumentList";
import SidebarFooter from "./SidebarFooter";
import type { Document } from "../../api/documents.api";

interface Props {
    documents: Document[];

    selectedDocument: Document | null;

    onSelect: (document: Document) => void;
    username?: string;

    onNewChat: () => void;
    onUpload: (file: File) => void;

    onDelete: (id: string) => void;
    onLogout: () => void;
}

export default function Sidebar({
    documents,
    selectedDocument,
    username,
    onNewChat,
    onUpload,
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
                <UploadSection onUpload={onUpload} />
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