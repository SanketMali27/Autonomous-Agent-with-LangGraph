import { create } from "zustand";
import {
    sendMessage as sendMessageApi,
    type ChatResponse,
} from "../api/chat.api";


export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}


interface ChatStore {
    messages: Message[];
    threadId: string;

    loading: boolean;
    error: string | null;

    sendMessage: (
        question: string,
        documentId?: string | null
    ) => Promise<void>;

    clearChat: () => void;
}


export const useChatStore = create<ChatStore>((set, get) => ({

    messages: [],

    threadId: crypto.randomUUID(),

    loading: false,

    error: null,


    sendMessage: async (
        question: string,
        documentId?: string | null
    ) => {

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: question,
        };

        set((state) => ({
            messages: [
                ...state.messages,
                userMessage,
            ],
            loading: true,
            error: null,
        }));


        try {

            const response: ChatResponse =
                await sendMessageApi({
                    question,
                    thread_id: get().threadId,
                    document_id: documentId,
                });


            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content:
                    response.answer ??
                    "No answer returned.",
            };


            set((state) => ({
                messages: [
                    ...state.messages,
                    assistantMessage,
                ],
                loading: false,
            }));

        } catch {

            set({
                loading: false,
                error: "Failed to send message",
            });

        }
    },


    clearChat: () => {

        set({
            messages: [],
            threadId: crypto.randomUUID(),
            error: null,
        });

    },

}));