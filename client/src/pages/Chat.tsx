import { useChatStore } from "../store/chatStore";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";

export default function Chat() {
    const messages = useChatStore(
        (state) => state.messages
    );

    const loading = useChatStore(
        (state) => state.loading
    );

    const error = useChatStore(
        (state) => state.error
    );

    const clearChat = useChatStore(
        (state) => state.clearChat
    );

    return (
        <main>

            <header>
                <h1>Autonomous Research Agent</h1>

                <button onClick={clearChat}>
                    New Chat
                </button>
            </header>


            <section>

                {messages.length === 0 && (
                    <p>
                        Ask a question or select a document
                        from the sidebar.
                    </p>
                )}


                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                    />
                ))}


                {loading && (
                    <p>Assistant is thinking...</p>
                )}


                {error && (
                    <p>{error}</p>
                )}

            </section>


            <ChatInput />

        </main>
    );
}