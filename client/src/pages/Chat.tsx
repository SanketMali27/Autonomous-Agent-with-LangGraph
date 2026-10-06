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
import { useEffect, useState } from "react";
import { useSessionStore } from "../store/sessionStore";
import { getApiErrorMessage } from "../lib/apiError";

type SessionMessagesRequest = ReturnType<typeof getSessionMessages>;
const sessionMessageRequests = new Map<string, SessionMessagesRequest>();

export default function Chat() {
    const {
        messagesBySession,
        loadedSessionIds,
        loading,
        loadingSessionId,
        error,
        pendingApproval,
        sendMessage,
        approve,
        setSessionMessages,
        setError,

    } = useChatStore();

    const {
        currentSessionId,
        setSessions,
        setError: setSessionError,

    } = useSessionStore();

    const activeCacheKey = currentSessionId || "";
    const messages = messagesBySession[activeCacheKey] ?? [];
    const [failedSessionId, setFailedSessionId] = useState<string | null>(null);
    const [sessionLoadAttempt, setSessionLoadAttempt] = useState(0);
    const messagesLoading = Boolean(currentSessionId)
        && !loadedSessionIds.includes(currentSessionId)
        && failedSessionId !== currentSessionId;

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
        if (useChatStore.getState().loadedSessionIds.includes(currentSessionId)) return;
        let cancelled = false;

        async function loadMessages() {
            try {
                let request = sessionMessageRequests.get(currentSessionId);
                if (!request) {
                    request = getSessionMessages(currentSessionId);
                    sessionMessageRequests.set(currentSessionId, request);
                    void request.then(
                        () => { if (sessionMessageRequests.get(currentSessionId) === request) sessionMessageRequests.delete(currentSessionId); },
                        () => { if (sessionMessageRequests.get(currentSessionId) === request) sessionMessageRequests.delete(currentSessionId); },
                    );
                }
                const msgs = await request;
                if (!useChatStore.getState().loadedSessionIds.includes(currentSessionId)) {
                    setSessionMessages(currentSessionId, msgs.map((m) => ({
                        id: m.message_id,
                        role: m.role,
                        content: m.content,
                    })));
                }
                setFailedSessionId(null);
            } catch (error) {
                if (!cancelled) {
                    setFailedSessionId(currentSessionId);
                    setError(getApiErrorMessage(error, "Unable to load this conversation."));
                }
            }
        }

        void loadMessages();
        return () => { cancelled = true; };
    }, [currentSessionId, sessionLoadAttempt, setError, setSessionMessages]);

    const {
        documents,
        selectedDocumentIds,
        toggleDocument,
        clearSelection,
    } = useDocumentStore();

    const scopeLabel = selectedDocumentIds.length === 0
        ? "All documents"
        : `${selectedDocumentIds.length} document${selectedDocumentIds.length === 1 ? "" : "s"} selected`;

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/8 bg-[#101729] shadow-xl shadow-black/20 sm:rounded-2xl">
            <div className="shrink-0 border-b border-white/8 bg-[#101729] px-4 py-3 md:px-5">
                <ChatHeader
                    scopeLabel={scopeLabel}
                    hasActiveScope
                />
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
                <ChatWindow
                    key={currentSessionId || "new-chat"}
                    messages={messages}
                    loading={loading && loadingSessionId === activeCacheKey && !messagesLoading}
                    sessionLoading={messagesLoading}
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
                    <span>{error}</span>
                    {failedSessionId === currentSessionId && <button type="button" onClick={() => {
                        setError(null);
                        setFailedSessionId(null);
                        setSessionLoadAttempt((attempt) => attempt + 1);
                    }} className="ml-3 rounded-md px-2 py-1 font-medium text-red-100 underline underline-offset-2 hover:bg-red-500/15 focus-visible:outline">Retry</button>}
                </div>
            )}

            <div className="z-10 shrink-0 border-t border-white/8 bg-[#101729] p-3 md:p-4">
                <div className="mb-3 lg:hidden">
                    <DocumentSelector
                        documents={documents}
                        selectedDocumentIds={selectedDocumentIds}
                        onToggleDocument={toggleDocument}
                        onClearSelection={clearSelection}
                    />
                </div>
                <div className="mx-auto mb-2 flex max-w-4xl items-center gap-2 text-xs text-slate-500">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Search scope:</span>
                    <span className="truncate font-medium text-slate-300">{scopeLabel}</span>
                </div>

                <ChatInput
                    loading={
                        loading ||
                        Boolean(pendingApproval)
                    }
                    selectedDocumentIds={selectedDocumentIds}
                    onSend={sendMessage}
                />
            </div>
        </div>
    );
}
