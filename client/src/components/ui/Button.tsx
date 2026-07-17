import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
}

export default function Button({
    children,
    className,
    variant = "primary",
    ...props
}: ButtonProps) {
    const variants = {
        primary:
            "bg-blue-600 hover:bg-blue-700 text-white",
        secondary:
            "bg-gray-200 hover:bg-gray-300 text-gray-800",
        danger:
            "bg-red-500 hover:bg-red-600 text-white",
    };

    return (
        <button
            className={clsx(
                "px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}