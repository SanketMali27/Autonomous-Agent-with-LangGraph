import api from "./axios";

export interface ChatRequest {
    question: string;
    thread_id: string;
    document_id?: string | null;
}

export interface ChatResponse {
    answer: string | null;
    status: "completed" | "waiting_for_approval";
    interrupt?: {
        question: string;
        answer: string;
        message: string;
    } | null;
}

export const sendMessage = async (
    data: ChatRequest
): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>("/chat", data);
    return response.data;
};

export const approveAction = async (
    threadId: string,
    approved: boolean
) => {
    const response = await api.post("/approve", {
        thread_id: threadId,
        approved,
    });

    return response.data;
};