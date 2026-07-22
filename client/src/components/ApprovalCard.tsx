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
        <div className="mx-auto mb-4 max-w-5xl rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100">
            <p className="font-semibold">Approval required</p>
            <p className="mt-2 text-sm text-amber-200/80">{message}</p>
            <p className="mt-3 text-sm"><span className="font-semibold">Question:</span> {question}</p>
            <p className="mt-1 text-sm"><span className="font-semibold">Proposed answer:</span> {answer}</p>
            <div className="mt-4 flex gap-3">
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => onDecision(true)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                    Approve
                </button>
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => onDecision(false)}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 disabled:opacity-50"
                >
                    Reject
                </button>
            </div>
        </div>
    );
}
