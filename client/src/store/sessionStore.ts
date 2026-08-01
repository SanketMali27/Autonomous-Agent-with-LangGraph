import { create } from "zustand";
import type { Session } from "../api/session.api";


interface SessionStore {
    sessions: Session[];
    currentSessionId: string;
    error: string | null;

    setSessions: (sessions: Session[]) => void;
    setError: (error: string | null) => void;
    setCurrentSession: (id: string) => void;
    addSession: (session: Session) => void;
    touchSession: (sessionId: string, title?: string) => void;
    removeSession: (id: string) => void;
}


export const useSessionStore = create<SessionStore>((set) => ({
    sessions: [],
    currentSessionId: "",
    error: null,

    setSessions: (sessions) => set({
        sessions: [...sessions].sort(
            (a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)
        ),
        error: null,
    }),

    setError: (error) => set({ error }),

    setCurrentSession: (id) =>
        set({ currentSessionId: id }),

    addSession: (session) =>
        set((state) => ({
            sessions: [
                session,
                ...state.sessions.filter(
                    (item) => item.session_id !== session.session_id
                ),
            ],
            currentSessionId: session.session_id,
        })),

    touchSession: (sessionId, title) =>
        set((state) => {
            const now = new Date().toISOString();
            const existing = state.sessions.find(
                (session) => session.session_id === sessionId
            );
            const updated: Session = existing
                ? {
                    ...existing,
                    title: title && existing.title === "New Chat"
                        ? title.slice(0, 50)
                        : existing.title,
                    updated_at: now,
                }
                : {
                    session_id: sessionId,
                    title: title?.slice(0, 50) || "New Chat",
                    created_at: now,
                    updated_at: now,
                };

            return {
                sessions: [
                    updated,
                    ...state.sessions.filter(
                        (session) => session.session_id !== sessionId
                    ),
                ],
                currentSessionId: sessionId,
            };
        }),

    removeSession: (id) =>
        set((state) => ({
            sessions: state.sessions.filter(
                (s) => s.session_id !== id
            ),
            currentSessionId: state.currentSessionId === id
                ? ""
                : state.currentSessionId,
        })),
}));
