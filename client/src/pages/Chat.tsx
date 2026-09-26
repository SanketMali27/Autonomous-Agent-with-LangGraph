import ApprovalCard from "../components/ApprovalCard";
import ChatHeader from "../components/chat/ChatHeader";
import ChatInput from "../components/chat/ChatInput";
import ChatWindow from "../components/chat/ChatWindow";
import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";
import DocumentSelector from "../components/DocumentSelector";
import {
    getSessions,
    getSessionMessages,
} from "../api/session.api";
import { useEffect } from "react";
import { useSessionStore } from "../store/sessionStore";
import { getApiErrorMessage } from "../lib/apiError";

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
        setError,

    } = useChatStore();

    const {
        currentSessionId,
        setSessions,
        setError: setSessionError,

    } = useSessionStore();

    useEffect(() => {
        async function load() {
            try {
                const data = await getSessions();
                setSessions(data);
            } catch (error) {
                setSessionError(getApiErrorMessage(error, "Unable to load conversations."));
            }
        }

        load();
    }, [setSessions, setSessionError]);

    useEffect(() => {
        if (!currentSessionId) return;

        async function loadMessages() {
            try {
                const msgs = await getSessionMessages(currentSessionId);
                setSessionId(currentSessionId);
                setMessages(msgs.map((m) => ({
                    id: m.message_id,
                    role: m.role,
                    content: m.content,
                })));
            } catch (error) {
                setError(getApiErrorMessage(error, "Unable to load this conversation."));
            }
        }

        void loadMessages();
    }, [currentSessionId, setError, setMessages, setSessionId]);

    const {
        documents,
        searchAll,
        selectedDocumentIds,
        setSearchAll,
        toggleDocument,
        clearSelection,
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
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/8 bg-[#101729] shadow-xl shadow-black/20 sm:rounded-2xl">
            <div className="shrink-0 border-b border-white/8 bg-[#101729] px-4 py-3 md:px-5">
                <ChatHeader
                    scopeLabel={scopeLabel}
                    hasActiveScope={
                        searchAll ||
                        selectedDocuments.length > 0
                    }
                />
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
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
                <div role="alert" className="mx-3 mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200 md:mx-5">
                    {error}
                </div>
            )}

            <div className="z-10 shrink-0 border-t border-white/8 bg-[#101729] p-3 md:p-4">
                <div className="mb-3 lg:hidden">
                    <DocumentSelector
                        documents={documents}
                        searchAll={searchAll}
                        selectedDocumentIds={selectedDocumentIds}
                        onSearchAllChange={setSearchAll}
                        onToggleDocument={toggleDocument}
                        onClearSelection={clearSelection}
                    />
                </div>
                <div className="mx-auto mb-2 flex max-w-4xl items-center gap-2 text-xs text-slate-500">
                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${searchAll || selectedDocuments.length > 0 ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <span>Search scope:</span>
                    <span className="truncate font-medium text-slate-300">{searchLabel}</span>
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
