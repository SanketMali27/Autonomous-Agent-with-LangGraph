import type { ReactNode } from "react";

interface Props {
    icon: ReactNode;
    title: string;
    description: string;
    children: ReactNode;
    footer: ReactNode;
}

export default function AuthShell({ icon, title, description, children, footer }: Props) {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1020] px-4 py-8">
            <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
            <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#11182a] p-6 shadow-2xl shadow-black/30 sm:p-8">
                <div className="mb-7">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-200">
                        {icon}
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                </div>
                {children}
                <div className="mt-7 border-t border-white/8 pt-5 text-center text-sm text-slate-400">
                    {footer}
                </div>
            </section>
        </main>
    );
}
