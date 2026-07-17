import Button from "../ui/Button";

interface Props {
    onNewChat: () => void;
}

export default function SidebarHeader({ onNewChat }: Props) {
    return (
        <div className="space-y-5">

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    🤖 AI Assistant
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                    Chat with your documents
                </p>
            </div>

            <Button
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-500 hover:to-indigo-500"
                onClick={onNewChat}
            >
                ✨ New Chat
            </Button>

        </div>
    );
}