import clsx from "clsx";

interface Props {
    role: "user" | "assistant";
    content: string;
}

export default function ChatMessage({
    role,
    content,
}: Props) {
    const isUser = role === "user";

    return (
        <div
            className={clsx(
                "flex mb-5",
                isUser
                    ? "justify-end"
                    : "justify-start"
            )}
        >
            <div
                className={clsx(
                    "max-w-2xl rounded-xl px-4 py-3 shadow",
                    isUser
                        ? "bg-blue-600 text-white"
                        : "bg-white border"
                )}
            >
                <div className="mb-2 text-xs font-semibold">
                    {isUser ? "You" : "Assistant"}
                </div>

                <p className="whitespace-pre-wrap">
                    {content}
                </p>
            </div>
        </div>
    );
}