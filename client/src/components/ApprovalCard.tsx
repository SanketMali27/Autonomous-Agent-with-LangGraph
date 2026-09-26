interface Props {
    question: string;
    answer: string;
    message: string;
    loading: boolean;
    onDecision: (approved: boolean) => Promise<boolean>;
}

export default function ApprovalCard({
    question,
    answer,
    message,
    loading,
    onDecision,
}: Props) {
    return (
        <div className="mx-3 mb-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3 text-amber-100 md:mx-auto md:max-w-4xl">
            <p className="text-sm font-semibold">Approval required</p>
            <p className="mt-2 text-sm text-amber-200/80">{message}</p>
            <p className="mt-3 text-sm"><span className="font-semibold">Question:</span> {question}</p>
            <p className="mt-1 text-sm"><span className="font-semibold">Proposed answer:</span> {answer}</p>
            <div className="mt-3 flex gap-2">
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => onDecision(true)}
                    className="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Approve
                </button>
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => onDecision(false)}
                    className="rounded-lg border border-slate-600 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Reject
                </button>
            </div>
        </div>
    );
}
