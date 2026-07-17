interface Props {
    documentName?: string;
}

export default function ChatHeader({
    documentName,
}: Props) {
    return (
        <header className="flex h-20 items-center justify-between">

            {/* Left */}
            <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xl shadow-lg">
                    🤖
                </div>

                <div>

                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Autonomous Research Agent
                    </h1>

                    <div className="mt-1 flex items-center gap-2">

                        <span
                            className={`h-2.5 w-2.5 rounded-full ${documentName
                                ? "bg-emerald-400"
                                : "bg-red-400"
                                }`}
                        />

                        <p className="text-sm text-slate-400">
                            {documentName ? (
                                <>
                                    <span className="font-medium text-slate-300">
                                        Active:
                                    </span>{" "}
                                    {documentName}
                                </>
                            ) : (
                                "No document selected"
                            )}
                        </p>

                    </div>

                </div>

            </div>

            {/* Right */}
            <div className="hidden rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2 md:flex">

                <div className="text-right">

                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Status
                    </p>

                    <p className="font-medium text-emerald-400">
                        ● Online
                    </p>

                </div>

            </div>

        </header>
    );
}