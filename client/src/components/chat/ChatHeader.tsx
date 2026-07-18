interface Props {
    documentName?: string;
}

export default function ChatHeader({ documentName }: Props) {
    return (
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl shadow-lg shadow-indigo-950/50">
                    🤖
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white">
                        Autonomous Research Agent
                    </h1>
                    <div className="mt-0.5 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${documentName ? "bg-emerald-400" : "bg-red-400"}`} />
                        <p className="text-sm text-slate-400">
                            {documentName ? (
                                <>
                                    <span className="font-medium text-slate-300">Active:</span>{" "}
                                    {documentName}
                                </>
                            ) : (
                                "No document selected"
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 md:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <p className="text-xs font-medium text-emerald-400">Online</p>
            </div>
        </header>
    );
}