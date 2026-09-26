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
        primary: "bg-blue-600 hover:bg-blue-500 text-white",
        secondary: "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700",
        danger: "bg-transparent text-red-300 hover:bg-red-500/10",
    };

    return (
        <button
            className={clsx(
                "inline-flex items-center justify-center rounded-lg px-3 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
