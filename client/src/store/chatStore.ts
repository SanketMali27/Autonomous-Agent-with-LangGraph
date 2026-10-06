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
    messagesBySession: Record<string, Message[]>;
    loadedSessionIds: string[];
    setSessionMessages: (id: string, messages: Message[]) => void;
    removeSessionMessages: (id: string) => void;
    setError: (error: string | null) => void;

    loading: boolean;
    loadingSessionId: string | null;
    error: string | null;
    pendingApproval: ChatResponse["interrupt"];

    sendMessage: (
        question: string,
        documentIds?: string[] | null
    ) => Promise<boolean>;
    approve: (approved: boolean) => Promise<boolean>;

    clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    messagesBySession: {},
    loadedSessionIds: [],
    loading: false,
    loadingSessionId: null,
    error: null,
    pendingApproval: null,

    setSessionMessages: (id, messages) => set((state) => ({
        messagesBySession: { ...state.messagesBySession, [id]: messages },
        loadedSessionIds: state.loadedSessionIds.includes(id)
            ? state.loadedSessionIds
            : [...state.loadedSessionIds, id],
    })),
    removeSessionMessages: (id) => set((state) => {
        const messagesBySession = { ...state.messagesBySession };
        delete messagesBySession[id];
        return {
            messagesBySession,
            loadedSessionIds: state.loadedSessionIds.filter((sessionId) => sessionId !== id),
        };
    }),
    setError: (error) => set({ error }),
    sendMessage: async (
        question,
        documentIds?: string[] | null
    ) => {
        const sessionId = useSessionStore.getState().currentSessionId;
        const cacheKey = sessionId || "";
        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: question,
        };

        set((state) => ({
            messagesBySession: {
                ...state.messagesBySession,
                [cacheKey]: [...(state.messagesBySession[cacheKey] ?? []), userMessage],
            },
            loadedSessionIds: state.loadedSessionIds.includes(cacheKey)
                ? state.loadedSessionIds
                : [...state.loadedSessionIds, cacheKey],
            loading: true,
            loadingSessionId: sessionId || "",
            error: null,
        }));

        try {
            const response: ChatResponse =
                await sendMessageApi({
                    question,
                    session_id: sessionId || null,
                    document_ids: documentIds ?? null,
                });

            if (response.session_id) {
                const responseSessionId = response.session_id;
                if (!sessionId) {
                    set((state) => {
                        const draftMessages = state.messagesBySession[""] ?? [];
                        const messagesBySession = { ...state.messagesBySession };
                        delete messagesBySession[""];
                        messagesBySession[responseSessionId] = draftMessages;
                        return {
                            messagesBySession,
                            loadedSessionIds: [...state.loadedSessionIds.filter((id) => id !== ""), responseSessionId],
                            loadingSessionId: responseSessionId,
                        };
                    });
                    if (!useSessionStore.getState().currentSessionId) {
                        useSessionStore.getState().setCurrentSession(responseSessionId);
                    }
                }
                useSessionStore.getState().touchSession(
                    responseSessionId,
                    question,
                );
            }

            if (
                response.status ===
                "waiting_for_approval"
            ) {
                set({
                    loading: false,
                    loadingSessionId: null,
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

            set((state) => {
                const responseSessionId = response.session_id || sessionId || "";
                return {
                messagesBySession: {
                    ...state.messagesBySession,
                    [responseSessionId]: [...(state.messagesBySession[responseSessionId] ?? []), assistantMessage],
                },
                loading: false,
                loadingSessionId: null,
            }; });

            return true;
        } catch (error) {
            set((state) => ({
                messagesBySession: {
                    ...state.messagesBySession,
                    [cacheKey]: (state.messagesBySession[cacheKey] ?? []).filter(
                        (message) => message.id !== userMessage.id,
                    ),
                },
                loading: false,
                loadingSessionId: null,
                error: getApiErrorMessage(
                    error,
                    "Failed to send message."
                ),
            }));

            return false;
        }
    },

    approve: async (approved) => {
        const sessionId = useSessionStore.getState().currentSessionId;
        set({
            loading: true,
            loadingSessionId: useSessionStore.getState().currentSessionId,
            error: null,
        });

        try {
            const response = await approveAction(
                sessionId,
                approved
            );

            if (response.session_id) {
                const responseSessionId = response.session_id;
                useSessionStore.getState().touchSession(
                    responseSessionId,
                );
            }

            set((state) => {
                const activeSessionId = response.session_id || sessionId;
                const messages = state.messagesBySession[activeSessionId] ?? [];
                return {
                messagesBySession: response.answer
                    ? {
                        ...state.messagesBySession,
                        [activeSessionId]: [...messages, {
                            id: crypto.randomUUID(),
                            role: "assistant" as const,
                            content: response.answer,
                        }],
                    }
                    : state.messagesBySession,
                pendingApproval:
                    response.interrupt ?? null,
                loading: false,
                loadingSessionId: null,
            }; });

            return true;
        } catch (error) {
            set({
                loading: false,
                loadingSessionId: null,
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
        set((state) => {
            const messagesBySession = { ...state.messagesBySession };
            delete messagesBySession[""];
            return {
            messagesBySession,
            loadedSessionIds: state.loadedSessionIds.filter((id) => id !== ""),
            error: null,
            pendingApproval: null,
            };
        });
    },
}));
