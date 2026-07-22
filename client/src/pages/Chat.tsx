import ChatHeader from "../components/chat/ChatHeader";
import ChatInput from "../components/chat/ChatInput";
import ChatWindow from "../components/chat/ChatWindow";
import ApprovalCard from "../components/ApprovalCard";

import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";

export default function Chat() {
    const { messages, loading, error, pendingApproval, sendMessage, approve } = useChatStore();
    const {
        selectedDocument,
        searchAll,
        selectedDocumentIds,
    } = useDocumentStore();
    const searchLabel = searchAll
        ? "All Documents"
        : `${selectedDocumentIds.length} Selected Documents`;

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-slate-900">
            <div className="border-b border-slate-700 bg-slate-900/80 px-6 py-3 backdrop-blur-xl">
                <ChatHeader documentName={selectedDocument?.document_name} />
            </div>

            <div className="flex-1 overflow-hidden">
                <ChatWindow messages={messages} loading={loading} />
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
                    <span aria-hidden="true">🔍</span>
                    <span>Searching:</span>
                    <span className="font-semibold text-blue-300">{searchLabel}</span>
                </div>
                <ChatInput
                    loading={loading || Boolean(pendingApproval)}
                    searchAll={searchAll}
                    selectedDocumentIds={selectedDocumentIds}
                    onSend={sendMessage}
                />
            </div>
        </div>
    );
}
