import clsx from "clsx";
import { Bot, User } from "lucide-react";

interface Props {
    role: "user" | "assistant";
    content: string;
}

export default function ChatMessage({
    role,
    content,
}: Props) {
    const isUser = role === "user";

    return (
        <div
            className={clsx(
                "mb-6 flex w-full",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={clsx(
                    "flex max-w-4xl items-start gap-3",
                    isUser && "flex-row-reverse"
                )}
            >
                {/* Avatar */}
                <div
                    className={clsx(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md",
                        isUser
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                    )}
                >
                    {isUser ? (
                        <User size={18} />
                    ) : (
                        <Bot size={18} />
                    )}
                </div>

                {/* Message */}
                <div
                    className={clsx(
                        "rounded-2xl border px-5 py-4 shadow-lg",
                        isUser
                            ? "border-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            : "border-slate-700 bg-slate-800 text-slate-100"
                    )}
                >


                    <p className="whitespace-pre-wrap break-words leading-7">
                        {content}
                    </p>
                </div>
            </div>
        </div>
    );
}