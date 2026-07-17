import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
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
            <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6">

                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl">
                    <Bot size={46} className="text-white" />
                </div>

                <h2 className="mt-8 text-3xl font-bold text-white">
                    Autonomous Research Agent
                </h2>

                <p className="mt-3 max-w-lg text-center leading-7 text-slate-400">
                    Upload a PDF and ask questions about your documents.
                    The AI will search, analyze, and generate answers using
                    Retrieval-Augmented Generation (RAG).
                </p>

                <div className="mt-10 grid w-full max-w-3xl gap-4 md:grid-cols-2">

                    <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                        <h3 className="mb-2 font-semibold text-white">
                            📄 Upload PDFs
                        </h3>

                        <p className="text-sm text-slate-400">
                            Add research papers, books, reports, or manuals.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                        <h3 className="mb-2 font-semibold text-white">
                            💬 Ask Questions
                        </h3>

                        <p className="text-sm text-slate-400">
                            Ask anything and receive AI-powered answers.
                        </p>
                    </div>

                </div>

            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">

            <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8">

                {messages.map((message, index) => (
                    <ChatMessage
                        key={index}
                        role={message.role}
                        content={message.content}
                    />
                ))}

                <div ref={bottomRef} />

            </div>

        </div>
    );
}