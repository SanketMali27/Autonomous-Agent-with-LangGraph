import { useState } from "react";

import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";


export default function ChatInput() {

    const [question, setQuestion] = useState("");

    const sendMessage = useChatStore(
        (state) => state.sendMessage
    );

    const loading = useChatStore(
        (state) => state.loading
    );

    const selectedDocument = useDocumentStore(
        (state) => state.selectedDocument
    );


    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        const trimmedQuestion = question.trim();

        if (!trimmedQuestion || loading) {
            return;
        }

        // Clear input immediately
        setQuestion("");

        await sendMessage(
            trimmedQuestion,
            selectedDocument?.document_id ?? null
        );
    };


    return (
        <form onSubmit={handleSubmit}>

            {selectedDocument && (
                <p>
                    Asking about: {selectedDocument.document_name}
                </p>
            )}

            <input
                type="text"
                value={question}
                onChange={(event) =>
                    setQuestion(event.target.value)
                }
                placeholder="Ask anything..."
                disabled={loading}
            />

            <button
                type="submit"
                disabled={loading || !question.trim()}
            >
                {loading ? "Thinking..." : "Send"}
            </button>

        </form>
    );
}