import type { FormEvent } from "react";
import { useState } from "react";
import Button from "../ui/Button";

interface Props {
    loading: boolean;
    onSend: (message: string) => Promise<void>;
}

export default function ChatInput({
    loading,
    onSend,
}: Props) {
    const [message, setMessage] =
        useState("");

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
            className="border-t bg-white p-4"
        >
            <div className="flex gap-3">

                <input
                    className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="Ask anything about your documents..."
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                />

                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "..." : "Send"}
                </Button>

            </div>
        </form>
    );
}