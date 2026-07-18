import type { ChangeEvent, KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import Button from "../ui/Button";

interface Props {
    loading: boolean;
    onSend: (message: string) => Promise<void>;
}

export default function ChatInput({ loading, onSend }: Props) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = async () => {
        if (!message.trim() || loading) return;
        await onSend(message);
        setMessage("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
    };

    return (
        <div className="border-t border-slate-700 bg-slate-900 p-3">
            <div className="mx-auto flex max-w-5xl items-end gap-3 rounded-2xl border border-slate-700 bg-slate-800 p-2.5 shadow-xl transition focus-within:border-blue-500">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Ask anything about your documents..."
                    className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-white placeholder:text-slate-400 outline-none"
                />

                <Button
                    type="button"
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                    {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        <SendHorizontal size={18} />
                    )}
                </Button>
            </div>

            <p className="mt-2 text-center text-xs text-slate-500">
                AI responses may contain mistakes. Verify important information.
            </p>
        </div>
    );
}