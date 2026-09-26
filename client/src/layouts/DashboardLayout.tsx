import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../components/sidebar/Sidebar";

import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";

export default function DashboardLayout() {
    const { logout, fetchCurrentUser, user } = useAuthStore();

    const {
        documents,
        fetchDocuments,
        uploadDocument,
        deleteDocument,
        loading: documentLoading,
        error: documentError,
        searchAll,
        selectedDocumentIds,
        setSearchAll,
        toggleDocument,
    } = useDocumentStore();

    const { clearChat } = useChatStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        void fetchDocuments();
        void fetchCurrentUser();
    }, [fetchDocuments, fetchCurrentUser]);

    return (
        <div className="flex h-dvh min-h-screen overflow-hidden bg-[#0b1020]">
            <Sidebar
                documents={documents}
                username={user?.username}
                onNewChat={() => {
                    clearChat();
                    setSidebarOpen(false);
                }}
                onUpload={uploadDocument}
                loading={documentLoading}
                error={documentError}
                searchAll={searchAll}
                selectedDocumentIds={selectedDocumentIds}
                onSearchAllChange={setSearchAll}
                onToggleDocument={toggleDocument}
                onDelete={deleteDocument}
                onLogout={logout}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-0 lg:p-3">
                <div className="flex shrink-0 items-center gap-3 border-b border-white/8 bg-[#0b1020] px-4 py-3 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open navigation"
                        className="rounded-lg p-2 text-slate-300 transition hover:bg-white/8 hover:text-white"
                    >
                        <Menu size={20} />
                    </button>
                    <div>
                        <p className="text-sm font-semibold text-white">Research Agent</p>
                        <p className="text-xs text-slate-500">Your AI workspace</p>
                    </div>
                </div>
                <div className="min-h-0 flex-1 p-2 sm:p-3 lg:p-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
