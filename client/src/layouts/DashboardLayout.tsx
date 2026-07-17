import { useEffect } from "react";
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
        fetchDocuments,
        uploadDocument,
        deleteDocument,
    } = useDocumentStore();

    const { clearChat } = useChatStore();

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    return (
        <div className="relative flex h-screen overflow-hidden bg-slate-950">
            {/* Ambient background glow — purely decorative, sits behind everything */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
                <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-3xl" />
            </div>

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

            <main className="relative z-10 flex flex-1 flex-col overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}