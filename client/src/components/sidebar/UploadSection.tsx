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
        <div className="border-b p-4">
            <label className="cursor-pointer block rounded-lg border-2 border-dashed p-4 text-center hover:bg-gray-100">
                Upload PDF

                <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={handleChange}
                />
            </label>
        </div>
    );
}