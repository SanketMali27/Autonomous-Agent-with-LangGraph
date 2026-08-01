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
        <div className={clsx("group mb-7 flex w-full px-1", isUser ? "justify-end" : "justify-start")}>
            <div className={clsx("flex w-full max-w-3xl items-start gap-3", isUser && "flex-row-reverse")}>
                <div
                    className={clsx(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md",
                        isUser
                            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                            : "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white"
                    )}
                >
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className="flex flex-col gap-1">
                    <div
                        className={clsx(
                            "rounded-2xl px-4 py-3 shadow-md transition-colors",
                            isUser
                                ? "rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                                : "rounded-tl-sm border border-slate-700 bg-slate-800 text-slate-100"
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
