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
        <aside className="flex h-screen w-72 flex-col border-r bg-white">

            <SidebarHeader
                onNewChat={onNewChat}
            />

            <UploadSection
                onUpload={onUpload}
            />

            <DocumentList
                documents={documents}
                selectedDocument={selectedDocument}
                onSelect={onSelect}
                onDelete={onDelete}
            />

            <SidebarFooter
                username={username}
                onLogout={onLogout}
            />

        </aside>
    );
}