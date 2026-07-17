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
            className={clsx(
                "group flex items-center justify-between rounded-lg p-2 cursor-pointer transition",
                selected
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
            )}
            onClick={onClick}
        >
            <span className="truncate">
                📄 {name}
            </span>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="hidden group-hover:block text-red-500"
            >
                ✕
            </button>
        </div>
    );
}