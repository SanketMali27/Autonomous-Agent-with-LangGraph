import type {
    ChangeEvent,
    KeyboardEvent,
} from "react";
import { useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import Button from "../ui/Button";
import {

    getSessions,


} from "../../api/session.api";
import { useSessionStore } from "../../store/sessionStore";

interface Props {
    loading: boolean;
    searchAll: boolean;
    selectedDocumentIds: string[];
    onSend: (
        message: string,
        documentIds: string[] | null
    ) => Promise<boolean>;
}

export default function ChatInput({
    loading,
    searchAll,
    selectedDocumentIds,
    onSend,
}: Props) {
    const [message, setMessage] = useState("");
    const textareaRef =
        useRef<HTMLTextAreaElement>(null);

    const canSend =
        searchAll ||
        selectedDocumentIds.length > 0;
    const {
        setSessions,
    } = useSessionStore();
    const handleSend = async () => {
        if (!message.trim() || loading || !canSend) {
            return;
        }

        const sent = await onSend(
            message,
            searchAll ? null : selectedDocumentIds
        );

        if (sent) {
            setMessage("");
            try {
                const sessions = await getSessions();
                setSessions(sessions);
            } catch {
                // The chat response already succeeded; keep the optimistic
                // sidebar order if refreshing the list temporarily fails.
            }

            if (textareaRef.current) {
                textareaRef.current.style.height =
                    "auto";
            }
        }
    };

    const handleKeyDown = (
        e: KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    };

    const handleChange = (
        e: ChangeEvent<HTMLTextAreaElement>
    ) => {
        setMessage(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(
            e.target.scrollHeight,
            160
        )}px`;
    };

    return (
        <div>
            <div className="mx-auto flex max-w-5xl items-end gap-3 rounded-2xl border border-slate-700 bg-slate-800 p-2.5 shadow-xl transition focus-within:border-blue-500">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder={
                        loading
                            ? "Working..."
                            : canSend
                                ? "Ask anything about your documents..."
                                : "Choose one or more documents, or switch to All Documents"
                    }
                    disabled={loading || !canSend}
                    className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-white placeholder:text-slate-400 outline-none"
                />

                <Button
                    type="button"
                    onClick={() => {
                        void handleSend();
                    }}
                    disabled={
                        loading ||
                        !message.trim() ||
                        !canSend
                    }
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
                {canSend
                    ? "AI responses may contain mistakes. Verify important information."
                    : "Select a document scope before sending your question."}
            </p>
        </div>
    );
}
