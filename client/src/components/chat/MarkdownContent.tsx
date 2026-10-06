import { isValidElement, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import bash from "highlight.js/lib/languages/bash";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

const highlightedLanguages = {
    bash,
    shell: bash,
    cpp,
    "c++": cpp,
    css,
    java,
    javascript,
    js: javascript,
    typescript,
    ts: typescript,
    json,
    markdown,
    md: markdown,
    python,
    py: python,
    sql,
    html: xml,
    xml,
    yaml,
    yml: yaml,
};

interface MarkdownAstNode {
    type: string;
    tagName?: string;
    properties?: { className?: string | string[] };
    children?: MarkdownAstNode[];
}

function skipUnknownLanguages() {
    return (tree: MarkdownAstNode) => {
        const visit = (node: MarkdownAstNode) => {
            if (node.type === "element" && node.tagName === "code") {
                const classes = Array.isArray(node.properties?.className)
                    ? node.properties.className
                    : typeof node.properties?.className === "string"
                        ? node.properties.className.split(/\s+/)
                        : [];
                const languageClass = classes.find((name) => name.startsWith("language-"));
                if (languageClass && !Object.hasOwn(highlightedLanguages, languageClass.slice(9))) {
                    node.properties = { ...node.properties, className: [...classes, "no-highlight"] };
                }
            }
            node.children?.forEach(visit);
        };
        visit(tree);
    };
}

const textFromNode = (node: ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(textFromNode).join("");
    if (isValidElement<{ children?: ReactNode }>(node)) return textFromNode(node.props.children);
    return "";
};

async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = text;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        const copied = document.execCommand("copy");
        temporaryInput.remove();
        if (!copied) throw new Error("Clipboard copy failed");
    }
}

function CodeBlock({ children, className }: { children: ReactNode; className?: string }) {
    const [copied, setCopied] = useState(false);
    const code = textFromNode(children).replace(/\n$/, "");
    const language = className?.match(/language-([\w+-]+)/)?.[1];

    const handleCopy = async () => {
        try {
            await copyText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="my-4 max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#080d17]">
            <div className="flex items-center justify-between border-b border-white/8 px-3 py-2 text-xs text-slate-400">
                <span className="font-medium">{language || "Code"}</span>
                <button type="button" onClick={() => void handleCopy()} aria-label={copied ? "Code copied" : "Copy code"} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-400 transition hover:bg-white/8 hover:text-white focus-visible:outline">
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
            <pre className="max-w-full overflow-x-auto p-4 text-[13px] leading-6 text-slate-200"><code className={className}>{children}</code></pre>
        </div>
    );
}

const components: Components = {
    h1: ({ children }) => <h1 className="mb-3 mt-6 text-2xl font-semibold tracking-tight text-white first:mt-0">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-3 mt-6 text-xl font-semibold tracking-tight text-white first:mt-0">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-2 mt-5 text-lg font-semibold text-white first:mt-0">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-2 mt-4 font-semibold text-white">{children}</h4>,
    p: ({ children }) => <p className="my-3 leading-7 first:mt-0 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-6 marker:text-slate-500">{children}</ul>,
    ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6 marker:text-slate-500">{children}</ol>,
    li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
    blockquote: ({ children }) => <blockquote className="my-4 border-l-2 border-blue-400/60 pl-4 text-slate-400">{children}</blockquote>,
    a: ({ href, children }) => {
        const safeHref = href && /^(https?:|mailto:|#)/i.test(href) ? href : undefined;
        const external = safeHref?.startsWith("http");
        return <a href={safeHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="text-blue-300 underline decoration-blue-400/40 underline-offset-2 hover:text-blue-200">{children}</a>;
    },
    code: ({ children, className, ...props }) => <code className={className ?? "rounded bg-slate-950/80 px-1.5 py-0.5 font-mono text-[0.9em] text-cyan-200"} {...props}>{children}</code>,
    pre: ({ children }) => {
        if (isValidElement<{ children?: ReactNode; className?: string }>(children)) {
            return <CodeBlock className={children.props.className}>{children.props.children}</CodeBlock>;
        }
        return <CodeBlock>{children}</CodeBlock>;
    },
    table: ({ children }) => <div className="my-4 max-w-full overflow-x-auto rounded-xl border border-white/10"><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
    thead: ({ children }) => <thead className="bg-white/[0.06] text-slate-100">{children}</thead>,
    th: ({ children }) => <th className="whitespace-nowrap border-b border-white/10 px-3 py-2.5 font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-t border-white/[0.06] px-3 py-2.5 align-top">{children}</td>,
    tr: ({ children }) => <tr className="even:bg-white/[0.02]">{children}</tr>,
    hr: () => <hr className="my-5 border-white/10" />,
};

interface Props {
    content: string;
}

export default function MarkdownContent({ content }: Props) {
    return <div className="min-w-0 max-w-full break-words text-[15px] leading-7 [&_code]:font-mono [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[skipUnknownLanguages, [rehypeHighlight, { languages: highlightedLanguages }]]} components={components}>
            {content}
        </ReactMarkdown>
    </div>;
}
