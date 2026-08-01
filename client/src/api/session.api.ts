import api from "./axios";

export interface Session {
    session_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    message_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

export async function getSessions(): Promise<Session[]> {
    const res = await api.get("/sessions");
    return res.data;
}

export async function createSession(title: string): Promise<Session> {
    const res = await api.post("/sessions", {
        title,
    });

    return res.data;
}

export async function getSessionMessages(
    sessionId: string
): Promise<ChatMessage[]> {
    const res = await api.get(`/sessions/${sessionId}`);
    return res.data;
}

export async function deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/sessions/${sessionId}`);
}
