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
        if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
            return "The assistant is taking longer than expected. Please try again.";
        }
        return "Unable to reach the server. Check your connection and try again.";
    }

    const data = error.response.data as ErrorEnvelope | string;
    if (typeof data === "string" && data) {
        return data.length <= 240 && !/traceback|exception|file ".*", line \d+/i.test(data)
            ? data
            : fallback;
    }
    const envelope = data as ErrorEnvelope;
    const detailMessage = messageFromDetails(envelope?.error?.details)
        ?? messageFromDetails(envelope?.detail);
    if (envelope?.error?.message) {
        if (envelope.error.code === "VALIDATION_ERROR" && detailMessage) {
            return `${envelope.error.message} ${detailMessage}`;
        }
        return envelope.error.message;
    }

    if (detailMessage) return detailMessage;
    if (typeof envelope?.detail === "string") {
        return envelope.detail.length <= 240 && !/traceback|exception|file ".*", line \d+/i.test(envelope.detail)
            ? envelope.detail
            : fallback;
    }
    if (typeof envelope?.message === "string") return envelope.message.slice(0, 240);

    return fallback;
};
