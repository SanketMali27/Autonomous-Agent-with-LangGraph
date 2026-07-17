import type { FormEvent } from "react";
import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import Button from "../ui/Button";

interface Props {
    loading: boolean;
    onSend: (message: string) => Promise<void>;
}

export default function ChatInput({
    loading,
    onSend,
}: Props) {
    const [message, setMessage] = useState("");

    const handleSubmit = async (
        e: FormEvent
    ) => {
        e.preventDefault();

        if (!message.trim()) return;

        await onSend(message);

        setMessage("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="border-t border-slate-700 bg-slate-900 p-5"
        >
            <div className="mx-auto flex max-w-5xl items-end gap-3 rounded-2xl border border-slate-700 bg-slate-800 p-3 shadow-xl transition focus-within:border-blue-500">

                <input
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                    placeholder="Ask anything about your documents..."
                    className="
                        flex-1
                        resize-none
                        bg-transparent
                        px-2
                        py-2
                        text-white
                        placeholder:text-slate-400
                        outline-none
                    "
                />

                <Button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="
                        flex items-center gap-2
                        rounded-xl
                        bg-gradient-to-r
                        from-blue-600
                        to-indigo-600
                        px-5
                        py-3
                        font-semibold
                        text-white
                        shadow-lg
                        transition-all
                        duration-300
                        hover:scale-105
                        hover:from-blue-500
                        hover:to-indigo-500
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        <>
                            <SendHorizontal size={18} />
                            Send
                        </>
                    )}
                </Button>

            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
                AI responses may contain mistakes. Verify important information.
            </p>

        </form>
    );
}