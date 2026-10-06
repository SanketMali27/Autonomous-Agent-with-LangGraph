import { useEffect, useRef, useState } from "react";
import { ArrowDown, BarChart3, Bot, FileText, Search } from "lucide-react";
import ChatMessage from "./ChatMessage";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface Props {
    messages: Message[];
    loading?: boolean;
    sessionLoading?: boolean;
}

export default function ChatWindow({
    messages,
    loading,
    sessionLoading = false,
}: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const nearBottomRef = useRef(true);
    const [showLatest, setShowLatest] = useState(false);

    useEffect(() => {
        if (nearBottomRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        } else {
            setShowLatest(true);
        }
    }, [messages, loading]);

    const handleScroll = () => {
        const element = scrollRef.current;
        if (!element) return;
        const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 120;
        nearBottomRef.current = nearBottom;
        setShowLatest(!nearBottom);
    };

    if (sessionLoading) {
        return <div className="flex h-full items-start justify-center bg-[#0e1525] px-5 pt-8" role="status" aria-label="Loading conversation">
            <div className="flex w-full max-w-4xl items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 text-sm text-slate-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
                Loading conversation…
            </div>
        </div>;
    }

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
        <div ref={scrollRef} onScroll={handleScroll} className="relative h-full overflow-y-auto scroll-smooth bg-[#0e1525]">
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
            {showLatest && <button type="button" onClick={() => {
                nearBottomRef.current = true;
                bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
                setShowLatest(false);
            }} className="sticky bottom-4 left-1/2 z-10 mx-auto flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 shadow-lg hover:bg-slate-700 focus-visible:outline" aria-label="Scroll to latest message">
                <ArrowDown size={14} /> Scroll to latest
            </button>}
        </div>
    );
}
