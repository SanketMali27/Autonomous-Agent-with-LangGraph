import type { ChangeEvent } from "react";
import { FileUp } from "lucide-react";

interface Props {
    onUpload: (file: File) => Promise<void>;
    loading: boolean;
}

export default function UploadSection({
    onUpload,
    loading,
}: Props) {
    const handleChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (file && !loading) {
            void onUpload(file);
        }
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between px-1">
                <div>
                    <p className="text-sm font-semibold text-white">Documents</p>
                    <p className="text-xs text-slate-500">Add PDFs to your workspace</p>
                </div>
                <FileUp size={16} className="text-slate-500" />
            </div>
            <label
                className="
                flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-700
                bg-slate-900/40 px-3 py-2.5 transition hover:border-blue-400/70 hover:bg-blue-500/5
                "
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                    <FileUp size={17} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                        {loading ? "Processing PDF..." : "Upload a PDF"}
                    </p>
                    <p className="text-xs text-slate-500">Click to browse</p>
                </div>

                <input
                    hidden
                    type="file"
                    accept=".pdf"
                    disabled={loading}
                    onChange={handleChange}
                />
            </label>
        </div>
    );
}
