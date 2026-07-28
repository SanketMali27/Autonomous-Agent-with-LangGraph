import ApprovalCard from "../components/ApprovalCard";
import ChatHeader from "../components/chat/ChatHeader";
import ChatInput from "../components/chat/ChatInput";
import ChatWindow from "../components/chat/ChatWindow";
import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";
import {
    getSessions,
    createSession,
    deleteSession,
    getSessionMessages,
} from "../api/session.api";
import { useEffect } from "react";
import { useSessionStore } from "../store/sessionStore";

export default function Chat() {
    const {
        messages,
        loading,
        error,
        pendingApproval,
        sendMessage,
        approve,
        setMessages,
        setSessionId,

    } = useChatStore();

    const {
        currentSessionId,
        setSessions,

    } = useSessionStore();

    useEffect(() => {
        async function load() {
            const data = await getSessions();
            setSessions(data);
        }

        load();
    }, []);

    useEffect(() => {
        if (!currentSessionId) return;

        async function loadMessages() {
            const msgs = await getSessionMessages(currentSessionId);

            setSessionId(currentSessionId);

            setMessages(
                msgs.map((m) => ({
                    id: m.message_id,
                    role: m.role,
                    content: m.content,
                }))
            );
        }

        loadMessages();
    }, [currentSessionId]);

    const {
        documents,
        searchAll,
        selectedDocumentIds,
    } = useDocumentStore();

    const selectedDocuments = documents.filter(
        (document) =>
            selectedDocumentIds.includes(
                document.document_id
            )
    );

    const scopeLabel = searchAll
        ? "All documents"
        : selectedDocuments.length === 0
            ? "No documents selected"
            : selectedDocuments.length === 1
                ? selectedDocuments[0].document_name
                : `${selectedDocuments.length} selected documents`;

    const searchLabel = searchAll
        ? "All documents"
        : selectedDocuments.length === 0
            ? "Choose one or more documents"
            : `${selectedDocuments.length} selected`;

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-slate-900">
            <div className="border-b border-slate-700 bg-slate-900/80 px-6 py-3 backdrop-blur-xl">
                <ChatHeader
                    scopeLabel={scopeLabel}
                    hasActiveScope={
                        searchAll ||
                        selectedDocuments.length > 0
                    }
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <ChatWindow
                    messages={messages}
                    loading={loading}
                />
            </div>

            {pendingApproval && (
                <ApprovalCard
                    {...pendingApproval}
                    loading={loading}
                    onDecision={approve}
                />
            )}

            {error && (
                <div className="mx-4 mb-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="border-t border-slate-700 bg-slate-900/90 p-4 backdrop-blur-xl">
                <div className="mx-auto mb-3 flex max-w-5xl items-center gap-2 text-xs text-slate-400">
                    <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full bg-blue-400"
                    />
                    <span>Searching:</span>
                    <span className="font-semibold text-blue-300">
                        {searchLabel}
                    </span>
                </div>

                <ChatInput
                    loading={
                        loading ||
                        Boolean(pendingApproval)
                    }
                    searchAll={searchAll}
                    selectedDocumentIds={
                        selectedDocumentIds
                    }
                    onSend={sendMessage}
                />
            </div>
        </div>
    );
}
