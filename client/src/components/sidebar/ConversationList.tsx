import { useState } from "react";
import { Check, MessageSquare, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { deleteSession, renameSession } from "../../api/session.api";
import { getApiErrorMessage } from "../../lib/apiError";
import { useChatStore } from "../../store/chatStore";
import { useSessionStore } from "../../store/sessionStore";

interface Props {
    onSelect?: () => void;
}

export default function ConversationList({ onSelect }: Props) {
    const {
        sessions,
        currentSessionId,
        setCurrentSession,
        removeSession,
        renameSession: updateSessionTitle,
        error,
        setError,
    } = useSessionStore();
    const removeCachedMessages = useChatStore((state) => state.removeSessionMessages);
    const [menuSessionId, setMenuSessionId] = useState<string | null>(null);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [saving, setSaving] = useState(false);

    const startRename = (id: string, title: string) => {
        setDraftTitle(title);
        setEditingSessionId(id);
        setMenuSessionId(null);
        setError(null);
    };

    const saveRename = async (id: string) => {
        const title = draftTitle.trim();
        if (!title) {
            setError("Conversation names cannot be empty.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const updated = await renameSession(id, title);
            updateSessionTitle(id, updated.title);
            setEditingSessionId(null);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "Unable to rename this conversation."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Delete “${title}”? This conversation will be removed.`)) return;
        setError(null);
        try {
            await deleteSession(id);
            removeCachedMessages(id);
            removeSession(id);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "Unable to delete this conversation."));
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recent chats</h2>
                {sessions.length > 0 && <span className="text-[11px] text-slate-600">{sessions.length}</span>}
            </div>

            {sessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
                    <p className="text-sm text-slate-400">No chats yet</p>
                    <p className="mt-1 text-xs text-slate-500">Start a new chat to begin.</p>
                </div>
            ) : (
                <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                    {sessions.map((session) => {
                        const active = currentSessionId === session.session_id;
                        const editing = editingSessionId === session.session_id;
                        const menuOpen = menuSessionId === session.session_id;
                        return (
                            <div key={session.session_id} className={`group relative flex min-w-0 items-center gap-1 rounded-xl border px-2 py-1.5 transition-colors duration-200 ${active ? "border-blue-400/30 bg-blue-500/10 text-white" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                                {editing ? (
                                    <form className="flex min-w-0 flex-1 items-center gap-1" onSubmit={(event) => { event.preventDefault(); void saveRename(session.session_id); }}>
                                        <input autoFocus value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} onKeyDown={(event) => {
                                            if (event.key === "Escape") { event.preventDefault(); setEditingSessionId(null); setError(null); }
                                        }} aria-label="Conversation name" maxLength={100} className="min-w-0 flex-1 rounded-md border border-blue-400/40 bg-slate-950 px-2 py-1 text-sm text-white outline-none focus:ring-2 focus:ring-blue-400/30" />
                                        <button type="submit" disabled={saving || !draftTitle.trim()} aria-label="Save conversation name" title="Save" className="rounded-md p-1.5 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-40"><Check size={15} /></button>
                                        <button type="button" onClick={() => { setEditingSessionId(null); setError(null); }} aria-label="Cancel rename" title="Cancel" className="rounded-md p-1.5 text-slate-400 hover:bg-white/10"><X size={15} /></button>
                                    </form>
                                ) : (
                                    <>
                                        <button type="button" onClick={() => { setCurrentSession(session.session_id); onSelect?.(); }} title={session.title} aria-current={active ? "page" : undefined} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left focus-visible:outline">
                                            <MessageSquare size={15} className="shrink-0 text-slate-500" />
                                            <span className="truncate text-sm font-medium">{session.title}</span>
                                        </button>
                                        <div className="relative shrink-0">
                                            <button type="button" title="Conversation actions" aria-label={`Actions for ${session.title}`} aria-haspopup="menu" aria-expanded={menuOpen} onClick={(event) => {
                                                event.stopPropagation();
                                                setMenuSessionId(menuOpen ? null : session.session_id);
                                            }} className="rounded-md p-1.5 text-slate-500 opacity-0 transition hover:bg-white/10 hover:text-white focus:opacity-100 group-hover:opacity-100">
                                                <MoreHorizontal size={16} />
                                            </button>
                                            {menuOpen && <div role="menu" aria-label={`Actions for ${session.title}`} className="absolute right-0 top-full z-30 mt-1 w-36 rounded-lg border border-white/10 bg-slate-900 p-1 shadow-xl">
                                                <button type="button" role="menuitem" onClick={() => startRename(session.session_id, session.title)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-white/8 focus-visible:outline"><Pencil size={13} /> Rename</button>
                                                <button type="button" role="menuitem" onClick={() => { setMenuSessionId(null); void handleDelete(session.session_id, session.title); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-red-300 hover:bg-red-500/10 focus-visible:outline"><Trash2 size={13} /> Delete</button>
                                            </div>}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {error && <p role="alert" className="mt-2 px-2 text-xs text-red-300">{error}</p>}
        </div>
    );
}
