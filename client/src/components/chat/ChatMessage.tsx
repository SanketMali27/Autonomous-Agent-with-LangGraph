import clsx from "clsx";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props {
    role: "user" | "assistant";
    content: string;
}

export default function ChatMessage({ role, content }: Props) {
    const isUser = role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className={clsx("group mb-6 flex w-full", isUser ? "justify-end" : "justify-start")}>
            <div className={clsx("flex max-w-3xl items-start gap-3", isUser && "flex-row-reverse")}>
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
                            "rounded-2xl px-4 py-3 shadow-md",
                            isUser
                                ? "rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                                : "rounded-tl-sm border border-slate-700 bg-slate-800 text-slate-100"
                        )}
                    >
                        <p className="whitespace-pre-wrap break-words leading-7">{content}</p>
                    </div>

                    {!isUser && (
                        <button
                            onClick={handleCopy}
                            className="flex w-fit items-center gap-1 self-start rounded-md px-1.5 py-1 text-xs text-slate-500 opacity-0 transition hover:text-slate-300 group-hover:opacity-100"
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