import type { Message } from "../store/chatStore";

interface ChatMessageProps {
    message: Message;
}

export default function ChatMessage({
    message,
}: ChatMessageProps) {

    const isUser = message.role === "user";

    return (
        <div>
            <strong>
                {isUser ? "You" : "Assistant"}
            </strong>

            <p>{message.content}</p>
        </div>
    );
}