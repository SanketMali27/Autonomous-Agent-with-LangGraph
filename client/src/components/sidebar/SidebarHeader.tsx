import Button from "../ui/Button";

interface Props {
    onNewChat: () => void;
}

export default function SidebarHeader({ onNewChat }: Props) {
    return (
        <div className="border-b p-4 space-y-4">
            <h1 className="text-xl font-bold text-blue-600">
                🤖 AI Assistant
            </h1>

            <Button
                className="w-full"
                onClick={onNewChat}
            >
                + New Chat
            </Button>
        </div>
    );
}