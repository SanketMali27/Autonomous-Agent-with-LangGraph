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

export interface ApprovalResponse {
    status: string;
    approved: boolean;
    answer: string | null;
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
): Promise<ApprovalResponse> => {

    const response = await api.post<ApprovalResponse>(
        "/approve",
        {
            thread_id: threadId,
            approved,
        }
    );

    return response.data;
};