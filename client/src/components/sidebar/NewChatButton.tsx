import { useChatStore } from "../../store/chatStore";

export default function NewChatButthon() {

    const clearChat = useChatStore(
        (state) => state.clearChat
    );

    return (
        <button onClick={clearChat}>
            New Chat
        </button>
    );
}