import { useChatStore } from "../../store/chatStore";
import {

createSession,


} from "../../api/session.api";
import { useSessionStore } from "../../store/sessionStore";


export default function NewChatButthon() {

    const clearChat = useChatStore(
        (state) => state.clearChat
    );
    const {
        addSession,
    } = useSessionStore();
    const {

        setSessionId,


    } = useChatStore();
    const handleNewChat = async () => {
        const session = await createSession("New Chat");

        addSession(session);

        setSessionId(session.session_id);

        clearChat();
    };

    return (
        <button onClick={handleNewChat}>
            New Chat
        </button>
    );
}