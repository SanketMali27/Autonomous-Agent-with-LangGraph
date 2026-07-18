import ChatHeader from "../components/chat/ChatHeader";
import ChatInput from "../components/chat/ChatInput";
import ChatWindow from "../components/chat/ChatWindow";

import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";

export default function Chat() {
    const { messages, loading, sendMessage } = useChatStore();
    const { selectedDocument } = useDocumentStore();

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-slate-900">
            <div className="border-b border-slate-700 bg-slate-900/80 px-6 py-3 backdrop-blur-xl">
                <ChatHeader documentName={selectedDocument?.document_name} />
            </div>

            <div className="flex-1 overflow-hidden">
                <ChatWindow messages={messages} loading={loading} />
            </div>

            <div className="border-t border-slate-700 bg-slate-900/90 p-4 backdrop-blur-xl">
                <ChatInput loading={loading} onSend={sendMessage} />
            </div>
        </div>
    );
}