import axios from "axios";

interface ErrorEnvelope {
    error?: {
        code?: string;
        message?: string;
        details?: unknown;
    };
    detail?: unknown;
    message?: string;
}

const messageFromDetails = (details: unknown): string | null => {
    if (!Array.isArray(details)) return null;

    const messages = details
        .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object" && "msg" in item) {
                return String(item.msg);
            }
            return null;
        })
        .filter((message): message is string => Boolean(message));

    return messages.length ? messages.join(" ") : null;
};

export const getApiErrorMessage = (
    error: unknown,
    fallback = "Something went wrong. Please try again.",
): string => {
    if (!axios.isAxiosError<ErrorEnvelope>(error)) {
        return error instanceof Error && error.message ? error.message : fallback;
    }

    if (!error.response) {
        return "Unable to reach the server. Check your connection and try again.";
    }

    const data = error.response.data;
    if (typeof data === "string" && data) return data;
    const detailMessage = messageFromDetails(data?.error?.details)
        ?? messageFromDetails(data?.detail);
    if (data?.error?.message) {
        if (data.error.code === "VALIDATION_ERROR" && detailMessage) {
            return `${data.error.message} ${detailMessage}`;
        }
        return data.error.message;
    }

    if (detailMessage) return detailMessage;
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;

    return fallback;
};
