import { MessageSquare } from "lucide-react";
import { Trash2 } from "lucide-react";
import { deleteSession } from "../../api/session.api";
import { useSessionStore } from "../../store/sessionStore";

export default function ConversationList() {
    const {
        sessions,
        currentSessionId,
        setCurrentSession,
        removeSession,
        error,
        setError,
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
                            <div
                                key={session.session_id}
                                className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-all duration-200 ${active
                                    ? "border border-blue-500 bg-slate-800 text-white"
                                    : "border border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white"
                                    }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setCurrentSession(session.session_id)}
                                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                >
                                    <MessageSquare size={16} className="shrink-0" />

                                    <span className="truncate text-sm font-medium">
                                        {session.title}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    title="Delete conversation"
                                    aria-label={`Delete ${session.title}`}
                                    onClick={() => {
                                        void (async () => {
                                            try {
                                                await deleteSession(session.session_id);
                                                removeSession(session.session_id);
                                            } catch {
                                                setError("Unable to delete this conversation.");
                                            }
                                        })();
                                    }}
                                    className="rounded-lg p-1.5 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/15 hover:text-red-300"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
            {error && (
                <p className="mt-2 px-2 text-xs text-red-300">{error}</p>
            )}
        </div>
    );
}
