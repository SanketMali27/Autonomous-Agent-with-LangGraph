import ChatHeader from "../components/chat/ChatHeader";
import ChatInput from "../components/chat/ChatInput";
import ChatWindow from "../components/chat/ChatWindow";

import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";

export default function Chat() {
    const {
        messages,
        loading,
        sendMessage,
    } = useChatStore();

    const {
        selectedDocument,
    } = useDocumentStore();

    return (
        <>
            <ChatHeader
                documentName={
                    selectedDocument?.document_name
                }
            />

            <ChatWindow
                messages={messages}
            />

            <ChatInput
                loading={loading}
                onSend={sendMessage}
            />
        </>
    );
}
