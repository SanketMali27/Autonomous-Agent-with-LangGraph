import type { ChangeEvent } from "react";

interface Props {
    onUpload: (file: File) => void;
}

export default function UploadSection({
    onUpload,
}: Props) {

    const handleChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (file) {
            onUpload(file);
        }
    };

    return (
        <div>

            <label
                className="
                flex cursor-pointer flex-col items-center justify-center
                rounded-2xl
                border-2 border-dashed border-slate-600
                bg-slate-800/60
                p-6
                text-center
                transition-all duration-300
                hover:border-blue-500
                hover:bg-slate-700/60
                "
            >

                <div className="mb-2 text-3xl">
                    📄
                </div>

                <p className="font-medium text-white">
                    Upload PDF
                </p>

                <p className="mt-1 text-xs text-slate-400">
                    Click to browse
                </p>

                <input
                    hidden
                    type="file"
                    accept=".pdf"
                    onChange={handleChange}
                />

            </label>

        </div>
    );
}