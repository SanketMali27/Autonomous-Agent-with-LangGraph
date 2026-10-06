import { create } from "zustand";
import type { Session } from "../api/session.api";


interface SessionStore {
    sessions: Session[];
    currentSessionId: string;
    error: string | null;

    setSessions: (sessions: Session[]) => void;
    setError: (error: string | null) => void;
    setCurrentSession: (id: string) => void;
    renameSession: (id: string, title: string) => void;
    addSession: (session: Session) => void;
    touchSession: (sessionId: string, title?: string) => void;
    removeSession: (id: string) => void;
}


export const useSessionStore = create<SessionStore>((set) => ({
    sessions: [],
    currentSessionId: "",
    error: null,

    setSessions: (sessions) => set((state) => {
        const serverIds = new Set(sessions.map((session) => session.session_id));
        const merged = [
            ...sessions.map((session) => {
                const local = state.sessions.find((item) => item.session_id === session.session_id);
                return local ? { ...session, title: local.title } : session;
            }),
            ...state.sessions.filter((session) => !serverIds.has(session.session_id)),
        ];
        return {
            sessions: merged.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)),
            error: null,
        };
    }),

    setError: (error) => set({ error }),

    setCurrentSession: (id) =>
        set({ currentSessionId: id }),

    renameSession: (id, title) =>
        set((state) => ({
            sessions: state.sessions.map((session) =>
                session.session_id === id ? { ...session, title } : session
            ),
        })),

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
            };
        }),

    removeSession: (id) =>
        set((state) => {
            const sessions = state.sessions.filter((session) => session.session_id !== id);
            return {
                sessions,
                currentSessionId: state.currentSessionId === id
                    ? sessions[0]?.session_id ?? ""
                    : state.currentSessionId,
            };
        }),
}));
