import clsx from "clsx";

interface Props {
    name: string;
    selected: boolean;
    onClick: () => void;
    onDelete: () => void;
}

export default function DocumentItem({
    name,
    selected,
    onClick,
    onDelete,
}: Props) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-300",
                selected
                    ? "border-blue-500 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 shadow-lg shadow-blue-500/20"
                    : "border-slate-700 bg-slate-800/60 hover:border-blue-400 hover:bg-slate-700/70 hover:shadow-lg"
            )}
        >
            {/* Left */}
            <div className="flex min-w-0 items-center gap-3">

                <div
                    className={clsx(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-lg transition",
                        selected
                            ? "bg-blue-500 text-white"
                            : "bg-slate-700 text-slate-300 group-hover:bg-blue-500 group-hover:text-white"
                    )}
                >
                    📄
                </div>

                <div className="min-w-0">

                    <p
                        className={clsx(
                            "truncate text-sm font-medium",
                            selected
                                ? "text-white"
                                : "text-slate-200"
                        )}
                    >
                        {name}
                    </p>

                    <p className="text-xs text-slate-400">
                        PDF Document
                    </p>

                </div>

            </div>

            {/* Delete Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="
                    rounded-lg
                    p-2
                    text-slate-400
                    opacity-0
                    transition-all
                    duration-300
                    hover:bg-red-500/20
                    hover:text-red-400
                    group-hover:opacity-100
                "
                title="Delete document"
            >
                🗑️
            </button>

            {/* Active Indicator */}
            {selected && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-500" />
            )}
        </div>
    );
}