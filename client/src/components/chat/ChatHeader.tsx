interface Props {
    documentName?: string;
}

export default function ChatHeader({
    documentName,
}: Props) {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <div>
                <h1 className="text-xl font-semibold">
                    Autonomous Research Agent
                </h1>

                <p className="text-sm text-gray-500">
                    {documentName
                        ? `Selected: ${documentName}`
                        : "No document selected"}
                </p>
            </div>
        </header>
    );
}