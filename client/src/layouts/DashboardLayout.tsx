import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";

import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";

export default function DashboardLayout() {
    const { user, logout } = useAuthStore();

    const {
        documents,
        selectedDocument,
        selectDocument,
        uploadDocument,
        deleteDocument,
    } = useDocumentStore();

    const { clearChat } = useChatStore();

    return (
        <div className="flex h-screen bg-gray-100">

            <Sidebar
                documents={documents}
                selectedDocument={selectedDocument}
                username={user?.username}
                onNewChat={clearChat}
                onUpload={uploadDocument}
                onSelect={selectDocument}
                onDelete={deleteDocument}
                onLogout={logout}
            />

            <main className="flex flex-1 flex-col">
                <Outlet />
            </main>

        </div>
    );
}