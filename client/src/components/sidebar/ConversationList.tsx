import { MessageSquare } from "lucide-react";
import { useSessionStore } from "../../store/sessionStore";

export default function ConversationList() {
    const {
        sessions,
        currentSessionId,
        setCurrentSession,
    } = useSessionStore();

    return (
        <div className="space-y-2">
            <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Conversations
            </h2>

            {sessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
                    <p className="text-sm text-slate-400">
                        No conversations yet
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Start a new chat to begin.
                    </p>
                </div>
            ) : (
                <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                    {sessions.map((session) => {
                        const active =
                            currentSessionId ===
                            session.session_id;

                        return (
                            <button
                                key={session.session_id}
                                onClick={() =>
                                    setCurrentSession(
                                        session.session_id
                                    )
                                }
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${active
                                    ? "border border-blue-500 bg-slate-800 text-white"
                                    : "border border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white"
                                    }`}
                            >
                                <MessageSquare
                                    size={16}
                                    className="shrink-0"
                                />

                                <span className="truncate text-sm font-medium">
                                    {session.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}