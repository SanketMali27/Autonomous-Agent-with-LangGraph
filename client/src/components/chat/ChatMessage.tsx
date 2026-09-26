import clsx from "clsx";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import MarkdownContent from "./MarkdownContent";

interface Props {
    role: "user" | "assistant";
    content: string;
}

export default function ChatMessage({ role, content }: Props) {
    const isUser = role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className={clsx("group flex w-full px-1", isUser ? "mb-4 justify-end" : "mb-5 justify-start")}>
            <div className={clsx("flex w-full items-start gap-2.5", isUser ? "max-w-[min(100%,42rem)] flex-row-reverse" : "max-w-3xl")}>
                <div
                    className={clsx(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        isUser
                            ? "bg-blue-500/20 text-blue-200"
                            : "bg-emerald-500/15 text-emerald-200"
                    )}
                >
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className="flex flex-col gap-1">
                    <div
                        className={clsx(
                            "px-3.5 py-2.5 text-[15px] leading-6 transition-colors sm:px-4",
                            isUser
                                ? "rounded-2xl rounded-tr-md bg-blue-600 text-white shadow-sm shadow-blue-950/20"
                                : "max-w-full rounded-xl border border-white/8 bg-white/[0.025] text-slate-200"
                        )}
                    >
                        {isUser ? (
                            <p className="whitespace-pre-wrap break-words leading-7">{content}</p>
                        ) : (
                            <MarkdownContent content={content} />
                        )}
                    </div>

                    {!isUser && (
                        <button
                            type="button"
                            onClick={() => void handleCopy()}
                            aria-label="Copy assistant response"
                            className="flex w-fit items-center gap-1 self-start rounded-md px-1.5 py-1 text-xs text-slate-500 opacity-70 transition hover:bg-slate-800 hover:text-slate-300 md:opacity-0 md:group-hover:opacity-100"
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
