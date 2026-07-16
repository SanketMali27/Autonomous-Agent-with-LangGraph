import { useRef } from "react";
import { useDocumentStore } from "../../store/documentStore";

export default function FileUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadDocument = useDocumentStore(
        (state) => state.uploadDocument
    );

    const loading = useDocumentStore(
        (state) => state.loading
    );

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            alert("Only PDF files are supported");
            return;
        }

        await uploadDocument(file);

        // Allows selecting the same file again later
        event.target.value = "";
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                hidden
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
            >
                {loading ? "Uploading..." : "Upload PDF"}
            </button>
        </div>
    );
}