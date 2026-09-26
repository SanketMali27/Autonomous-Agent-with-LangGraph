import clsx from "clsx";
import {
    FileText,
    Trash2,
} from "lucide-react";

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
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick();
                }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            className={clsx(
                "group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-xl border px-3 py-2.5 transition",
                selected
                    ? "border-blue-400/30 bg-blue-500/10"
                    : "border-transparent bg-slate-900/20 hover:border-white/10 hover:bg-white/5"
            )}
        >
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className={clsx(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition",
                        selected
                            ? "bg-blue-500/20 text-blue-200"
                            : "bg-slate-800 text-slate-500 group-hover:text-slate-300"
                    )}
                >
                    <FileText size={18} />
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

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="rounded-lg p-2 text-slate-500 opacity-0 transition group-hover:opacity-100 focus:opacity-100 hover:bg-red-500/15 hover:text-red-300"
                title="Delete document"
                aria-label={`Delete ${name}`}
            >
                <Trash2 size={16} />
            </button>

            {selected && (
                <div className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-blue-500" />
            )}
        </div>
    );
}
