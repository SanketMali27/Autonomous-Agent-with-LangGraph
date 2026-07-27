import { create } from "zustand";
import type { Session } from "../api/session.api";


interface SessionStore {
    sessions: Session[];
    currentSessionId: string | null;

    setSessions: (sessions: Session[]) => void;
    setCurrentSession: (id: string) => void;
    addSession: (session: Session) => void;
    removeSession: (id: string) => void;
}


export const useSessionStore = create<SessionStore>((set) => ({
    sessions: [],
    currentSessionId: null,

    setSessions: (sessions) => set({ sessions }),

    setCurrentSession: (id) =>
        set({ currentSessionId: id }),

    addSession: (session) =>
        set((state) => ({
            sessions: [session, ...state.sessions],
            currentSessionId: session.session_id,
        })),

    removeSession: (id) =>
        set((state) => ({
            sessions: state.sessions.filter(
                (s) => s.session_id !== id
            ),
        })),
}));