import { useEffect, useRef } from "react";
import { BarChart3, Bot, FileText, Search } from "lucide-react";
import ChatMessage from "./ChatMessage";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface Props {
    messages: Message[];
    loading?: boolean;
}

export default function ChatWindow({
    messages,
    loading,
}: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    if (messages.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center overflow-y-auto bg-[#0e1525] px-5 py-10 sm:px-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
                    <Bot size={28} />
                </div>

                <h2 className="mt-5 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    What are you researching?
                </h2>

                <p className="mt-3 max-w-xl text-center text-sm leading-6 text-slate-400 sm:text-base">
                    Ask questions across your uploaded documents. The agent can search, analyze data, and explain its findings.
                </p>

                <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-3">
                    {[
                        [FileText, "Search documents", "Find relevant passages"],
                        [Search, "Research", "Compare and synthesize"],
                        [BarChart3, "Analyze", "Work with data and trends"],
                    ].map(([Icon, title, description]) => (
                        <div key={title as string} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-left">
                            <Icon size={16} className="text-blue-300" />
                            <p className="mt-2 text-sm font-medium text-slate-200">{title as string}</p>
                            <p className="mt-0.5 text-xs leading-5 text-slate-500">{description as string}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto scroll-smooth bg-[#0e1525]">
            <div className="mx-auto flex max-w-4xl flex-col gap-1 px-3 py-5 sm:px-5 sm:py-7">
                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        role={message.role}
                        content={message.content}
                    />
                ))}

                {loading && (
                    <div className="mb-5 flex w-full justify-start px-1">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-200">
                                <Bot size={16} />
                            </div>
                            <div className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
}
