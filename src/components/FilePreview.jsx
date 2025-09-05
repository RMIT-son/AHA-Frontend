import { memo } from "react";

const FilePreview = memo(({ uploadedFiles, removeFile }) => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
        return null;
    }

    const getFileIcon = (file) => {
        const fileName = file.name || "";
        const fileType = file.type || "";

        if (
            fileType.startsWith("audio/") ||
            /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(fileName)
        ) {
            return (
                <svg
                    className="w-6 h-6"
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
        }

        if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
            return (
                <svg
                    className="w-6 h-6"
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
        }

        // Default document icon
        return (
            <svg
                className="w-6 h-6"
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
    };

    const getFileTypeLabel = (file) => {
        const fileName = file.name || "";
        const fileType = file.type || "";

        if (fileType.startsWith("image/")) return "IMG";
        if (fileType.startsWith("audio/")) return "AUDIO";
        if (fileType.includes("pdf")) return "PDF";
        if (
            fileType.includes("word") ||
            fileName.endsWith(".doc") ||
            fileName.endsWith(".docx")
        )
            return "DOC";
        if (
            fileType.includes("excel") ||
            fileName.endsWith(".xls") ||
            fileName.endsWith(".xlsx")
        )
            return "XLS";
        if (fileType.includes("text") || fileName.endsWith(".txt"))
            return "TXT";

        // Try to extract extension
        const extension = fileName.split(".").pop()?.toUpperCase();
        return extension || "FILE";
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const isImage = (file) => {
        return (
            file.type?.startsWith("image/") ||
            /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name || "")
        );
    };

    return (
        <div className="pb-3">
            <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative group">
                        {/* Square container for all file types */}
                        <div className="w-20 h-20 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden relative hover:shadow-md transition-shadow">
                            {isImage(file) ? (
                                // Image preview
                                <div className="w-full h-full">
                                    <img
                                        src={
                                            file.preview ||
                                            URL.createObjectURL(
                                                file.file || file
                                            )
                                        }
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback to file icon if image fails to load
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                                "flex";
                                        }}
                                    />
                                    {/* Fallback icon (hidden by default) */}
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hidden">
                                        <svg
                                            className="w-6 h-6 mb-1"
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
                                        <span className="text-xs font-medium">
                                            IMG
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                // File icon for non-images
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                    {getFileIcon(file)}
                                    <span className="text-xs font-medium mt-1">
                                        {getFileTypeLabel(file)}
                                    </span>
                                </div>
                            )}

                            {/* Remove button */}
                            <button
                                onClick={() => removeFile(file.id)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
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

                        {/* File info below the square */}
                        <div className="mt-1 text-center">
                            <p
                                className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-20"
                                title={file.name}
                            >
                                {file.name}
                            </p>
                            {file.size && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {formatFileSize(file.size)}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

FilePreview.displayName = "FilePreview";

export default FilePreview;
