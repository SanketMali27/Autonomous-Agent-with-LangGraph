interface Props {
    scopeLabel: string;
    hasActiveScope: boolean;
}

export default function ChatHeader({
    scopeLabel,
    hasActiveScope,
}: Props) {
    return (
        <header className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-sm font-bold text-blue-200">
                    AI
                </div>
                <div className="min-w-0">
                    <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                        Autonomous Research Agent
                    </h1>
                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${hasActiveScope ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <span className="truncate">{hasActiveScope ? `Searching ${scopeLabel}` : "Select a document scope to begin"}</span>
                    </div>
                </div>
            </div>
            <span className="hidden shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-500 sm:inline-flex">
                Research workspace
            </span>
        </header>
    );
}
