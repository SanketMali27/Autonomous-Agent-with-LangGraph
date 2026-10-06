import { useChatStore } from "../../store/chatStore";
import { useSessionStore } from "../../store/sessionStore";

export default function NewChatButton() {
    const clearChat = useChatStore((state) => state.clearChat);
    const setCurrentSession = useSessionStore((state) => state.setCurrentSession);

    return <button type="button" onClick={() => { setCurrentSession(""); clearChat(); }}>New Chat</button>;
}
