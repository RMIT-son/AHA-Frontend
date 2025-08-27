export default function FilePreview({ uploadedFiles, removeFile }) {
    const getFileIcon = (type) => {
        if (type.startsWith("image/")) {
            return (
                <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            );
        } else if (type === "application/pdf") {
            return (
                <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
            );
        } else if (type.startsWith("audio/")) {
            return (
                <svg
                    className="w-5 h-5 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 12.464a9 9 0 010-8.928M12 19V5M8.464 12.464a9 9 0 010-8.928"
                    />
                </svg>
            );
        } else {
            return (
                <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            );
        }
    };

    const getFileTypeLabel = (type, name) => {
        if (type.startsWith("audio/")) {
            const extension = name.split(".").pop()?.toUpperCase();
            return extension || "AUDIO";
        } else if (type === "application/pdf") {
            return "PDF";
        } else if (type.startsWith("image/")) {
            return "IMAGE";
        } else if (type.includes("csv")) {
            return "CSV";
        } else if (type.includes("json")) {
            return "JSON";
        } else if (type.includes("text")) {
            return "TEXT";
        }
        return "FILE";
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (uploadedFiles.length === 0) return null;

    return (
        <div className="pb-4">
            <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((fileData) => (
                    <div key={fileData.id} className="relative group">
                        {fileData.preview ? (
                            // Image preview
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                <img
                                    src={fileData.preview}
                                    alt={fileData.name}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => removeFile(fileData.id)}
                                    className="absolute top-1 right-1 w-4 h-4 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove image"
                                >
                                    <svg
                                        className="w-2.5 h-2.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            // File icon preview
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors min-w-[120px]">
                                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                    {getFileIcon(fileData.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded">
                                            {getFileTypeLabel(
                                                fileData.type,
                                                fileData.name
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-900 truncate max-w-20">
                                        {fileData.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(fileData.size)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFile(fileData.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                    title="Remove file"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
