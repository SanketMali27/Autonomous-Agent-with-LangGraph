import { create } from "zustand";
import {
    sendMessage as sendMessageApi,
    approveAction,
    type ChatResponse,
} from "../api/chat.api";
import { getApiErrorMessage } from "../lib/apiError";
import { useSessionStore } from "./sessionStore";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface ChatStore {
    messages: Message[];
    sessionId: string | null;

    setSessionId: (id: string) => void;

    setMessages: (messages: Message[]) => void;
    setError: (error: string | null) => void;

    loading: boolean;
    error: string | null;
    pendingApproval: ChatResponse["interrupt"];

    sendMessage: (
        question: string,
        documentIds?: string[] | null
    ) => Promise<boolean>;
    approve: (approved: boolean) => Promise<boolean>;

    clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: [],
    sessionId: null,
    loading: false,
    error: null,
    pendingApproval: null,

    setSessionId: (id) =>
        set({
            sessionId: id,
        }),

    setMessages: (messages) =>
        set({
            messages,
        }),
    setError: (error) => set({ error }),
    sendMessage: async (
        question,
        documentIds?: string[] | null
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
                    session_id: get().sessionId!,
                    document_ids: documentIds ?? null,
                });

            if (response.session_id) {
                set({ sessionId: response.session_id });
                useSessionStore.getState().touchSession(
                    response.session_id,
                    question,
                );
            }

            if (
                response.status ===
                "waiting_for_approval"
            ) {
                set({
                    loading: false,
                    pendingApproval:
                        response.interrupt ?? null,
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
                error: getApiErrorMessage(
                    error,
                    "Failed to send message."
                ),
            });

            return false;
        }
    },

    approve: async (approved) => {
        set({
            loading: true,
            error: null,
        });

        try {
            const response = await approveAction(
                get().sessionId!,
                approved
            );

            if (response.session_id) {
                set({ sessionId: response.session_id });
                useSessionStore.getState().touchSession(
                    response.session_id,
                );
            }

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
                pendingApproval:
                    response.interrupt ?? null,
                loading: false,
            }));

            return true;
        } catch (error) {
            set({
                loading: false,
                error: getApiErrorMessage(
                    error,
                    "The approval could not be completed."
                ),
            });

            return false;
        }
    },

    clearChat: () => {
        useSessionStore.getState().setCurrentSession("");
        set({
            messages: [],
            sessionId: null,
            error: null,
            pendingApproval: null,
        });
    },
}));
