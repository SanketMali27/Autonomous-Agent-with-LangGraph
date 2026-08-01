import type { ReactNode } from "react";

const renderInline = (text: string): ReactNode[] => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^\x29]+\x29)/g);

    return parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code key={index} className="rounded bg-slate-950/70 px-1.5 py-0.5 text-[0.9em] text-cyan-200">
                    {part.slice(1, -1)}
                </code>
            );
        }

        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }

        const link = part.match(/^\[([^\]]+)\]\(([^\x29]+)\x29$/);
        if (link && /^https?:\/\//.test(link[2])) {
            return (
                <a
                    key={index}
                    href={link[2]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-300 underline underline-offset-2 hover:text-blue-200"
                >
                    {link[1]}
                </a>
            );
        }

        return <span key={index}>{part}</span>;
    });
};

interface Props {
    content: string;
}

export default function MarkdownContent({ content }: Props) {
    const lines = content.replace(/\r/g, "").split("\n");
    const blocks: ReactNode[] = [];
    let codeLines: string[] = [];
    let inCode = false;

    const flushCode = () => {
        if (!codeLines.length) return;
        blocks.push(
            <pre key={`code-${blocks.length}`} className="my-3 overflow-x-auto rounded-xl bg-slate-950/80 p-3 text-xs leading-6 text-cyan-100">
                <code>{codeLines.join("\n")}</code>
            </pre>
        );
        codeLines = [];
    };

    lines.forEach((line, index) => {
        if (line.trim().startsWith("```")) {
            if (inCode) flushCode();
            inCode = !inCode;
            return;
        }

        if (inCode) {
            codeLines.push(line);
            return;
        }

        if (!line.trim()) {
            return;
        }

        const heading = line.match(/^#{1,3}\s+(.+)$/);
        if (heading) {
            blocks.push(
                <h3 key={`heading-${index}`} className="mt-3 font-semibold text-white first:mt-0">
                    {renderInline(heading[1])}
                </h3>
            );
            return;
        }

        if (/^[-*]\s+/.test(line)) {
            blocks.push(
                <li key={`item-${index}`} className="ml-5 list-disc pl-1">
                    {renderInline(line.replace(/^[-*]\s+/, ""))}
                </li>
            );
            return;
        }

        blocks.push(
            <p key={`paragraph-${index}`} className="leading-7">
                {renderInline(line)}
            </p>
        );
    });

    if (inCode) flushCode();

    return <div className="space-y-2 break-words">{blocks}</div>;
}
