import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface Props {
    messages: Message[];
}

export default function ChatWindow({
    messages,
}: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center text-gray-500">
                Start a conversation 🚀
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {messages.map((message, index) => (
                <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                />
            ))}

            <div ref={bottomRef} />
        </div>
    );
}