import { Bot, Plus } from "lucide-react";
import Button from "../ui/Button";

interface Props {
    onNewChat: () => void;
}

export default function SidebarHeader({
    onNewChat,
}: Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                    <Bot size={20} />
                </div>
                <div className="min-w-0">
                    <h1 className="truncate text-sm font-semibold tracking-tight text-white">
                        Research Agent
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Your AI workspace
                    </p>
                </div>
            </div>

            <Button
                className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/25 transition hover:bg-blue-500"
                onClick={onNewChat}
            >
                <span className="inline-flex items-center gap-2">
                    <Plus size={17} />
                    New Chat
                </span>
            </Button>
        </div>
    );
}
