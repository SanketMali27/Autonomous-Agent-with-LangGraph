import type { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export default function Card({
    children,
    className,
}: CardProps) {
    return (
        <div
            className={clsx(
                "bg-white rounded-xl shadow border border-gray-200",
                className
            )}
        >
            {children}
        </div>
    );
}