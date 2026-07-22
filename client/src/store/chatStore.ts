import { create } from "zustand";
import {
    sendMessage as sendMessageApi,
    approveAction,
    type ChatResponse,
} from "../api/chat.api";
import { getApiErrorMessage } from "../lib/apiError";
import { useDocumentStore } from "./documentStore";


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
    pendingApproval: ChatResponse["interrupt"];

    sendMessage: (
        question: string,
    ) => Promise<boolean>;
    approve: (approved: boolean) => Promise<boolean>;

    clearChat: () => void;
}


export const useChatStore = create<ChatStore>((set, get) => ({

    messages: [],

    threadId: crypto.randomUUID(),

    loading: false,

    error: null,

    pendingApproval: null,


    sendMessage: async (
        question: string,
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
            const {
                searchAll,
                selectedDocumentIds,
            } = useDocumentStore.getState();

            const response: ChatResponse =
                await sendMessageApi({
                    question,
                    thread_id: get().threadId,
                    document_ids: searchAll ? null : selectedDocumentIds,
                });

            if (response.status === "waiting_for_approval") {
                set({
                    loading: false,
                    pendingApproval: response.interrupt ?? null,
                });
                return true;
            }

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
            return true;

        } catch (error) {

            set({
                loading: false,
                error: getApiErrorMessage(error, "Failed to send message."),
            });
            return false;

        }
    },

    approve: async (approved) => {
        set({ loading: true, error: null });

        try {
            const response = await approveAction(get().threadId, approved);
            set((state) => ({
                messages: response.answer
                    ? [
                        ...state.messages,
                        {
                            id: crypto.randomUUID(),
                            role: "assistant" as const,
                            content: response.answer,
                        },
                    ]
                    : state.messages,
                pendingApproval: response.interrupt ?? null,
                loading: false,
            }));
            return true;
        } catch (error) {
            set({
                loading: false,
                error: getApiErrorMessage(error, "The approval could not be completed."),
            });
            return false;
        }
    },


    clearChat: () => {

        set({
            messages: [],
            threadId: crypto.randomUUID(),
            error: null,
            pendingApproval: null,
        });

    },

}));
