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
            <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-slate-700/90 bg-slate-900 p-2 shadow-lg shadow-black/10 transition focus-within:border-blue-400/70 focus-within:ring-1 focus-within:ring-blue-400/20">
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
                    aria-label="Message"
                    className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-white placeholder:text-slate-500 outline-none"
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
                    aria-label="Send message"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 p-0 text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        <SendHorizontal size={18} />
                    )}
                </Button>
            </div>

            <p className="mt-2 text-center text-[11px] text-slate-600">
                {canSend
                    ? "AI responses may contain mistakes. Verify important information."
                    : "Select a document scope before sending your question."}
            </p>
        </div>
    );
}
