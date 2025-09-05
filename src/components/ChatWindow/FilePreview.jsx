import { memo, useState, useCallback } from "react";

const FilePreview = memo(
    ({ file, index, onImageClick, onFileClick, messageKey }) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoaded, setImageLoaded] = useState(false);

        // Helper function to get file info
        const getFileInfo = useCallback(() => {
            if (typeof file === "string") {
                const url = file;
                const fileName = url.split("/").pop() || "Unknown file";
                const extension =
                    fileName.split(".").pop()?.toLowerCase() || "";
                return { url, fileName, extension, size: null };
            }

            return {
                url: file?.url || file?.file || file?.src || file?.path || "",
                fileName: file?.name || file?.fileName || `File ${index + 1}`,
                extension:
                    file?.type?.split("/").pop() ||
                    file?.name?.split(".").pop()?.toLowerCase() ||
                    "",
                size: file?.size || null,
                type: file?.type || "",
            };
        }, [file, index]);

        const fileInfo = getFileInfo();

        // Check if file is an image
        const isImage = useCallback(() => {
            const imageExtensions = [
                "jpg",
                "jpeg",
                "png",
                "gif",
                "bmp",
                "webp",
                "svg",
            ];
            return (
                imageExtensions.includes(fileInfo.extension) ||
                fileInfo.type?.startsWith("image/")
            );
        }, [fileInfo]);

        // Check if file is audio
        const isAudio = useCallback(() => {
            const audioExtensions = ["mp3", "wav", "ogg", "m4a", "aac"];
            return (
                audioExtensions.includes(fileInfo.extension) ||
                fileInfo.type?.startsWith("audio/")
            );
        }, [fileInfo]);

        // Format file size
        const formatFileSize = useCallback((bytes) => {
            if (!bytes) return "";
            const sizes = ["Bytes", "KB", "MB", "GB"];
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return (
                Math.round((bytes / Math.pow(1024, i)) * 100) / 100 +
                " " +
                sizes[i]
            );
        }, []);

        // Get file icon and color based on type
        const getFileIconAndColor = useCallback(() => {
            const { extension } = fileInfo;

            if (isImage()) {
                return {
                    icon: (
                        <svg
                            className="w-5 h-5"
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
                    ),
                    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                };
            }

            if (isAudio()) {
                return {
                    icon: (
                        <svg
                            className="w-5 h-5"
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
                    ),
                    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
                };
            }

            if (["pdf"].includes(extension)) {
                return {
                    icon: (
                        <svg
                            className="w-5 h-5"
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
                    ),
                    color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
                };
            }

            // Default file icon
            return {
                icon: (
                    <svg
                        className="w-5 h-5"
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
                ),
                color: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20",
            };
        }, [fileInfo, isImage, isAudio]);

        const handleClick = useCallback(() => {
            if (isImage()) {
                onImageClick(fileInfo.url, fileInfo.fileName);
            } else {
                onFileClick?.(fileInfo);
            }
        }, [isImage, fileInfo, onImageClick, onFileClick]);

        const handleImageLoad = useCallback(() => {
            setImageLoaded(true);
            setImageError(false);
        }, []);

        const handleImageError = useCallback(() => {
            setImageError(true);
            setImageLoaded(false);
        }, []);

        if (!fileInfo.url) {
            return null;
        }

        // Render image preview
        if (isImage() && !imageError) {
            return (
                <div className="mt-2 max-w-md">
                    {!imageLoaded && (
                        <div className="animate-pulse bg-gray-200 dark:bg-neutral-700 rounded-lg h-48 max-w-sm flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-gray-400"
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
                        </div>
                    )}
                    <img
                        src={fileInfo.url}
                        alt={fileInfo.fileName}
                        className={`rounded-lg max-w-full h-auto shadow-sm border border-gray-200 dark:border-neutral-700 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                            imageLoaded ? "opacity-100" : "opacity-0 absolute"
                        }`}
                        style={{ maxHeight: "400px" }}
                        onClick={handleClick}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        loading="lazy"
                    />

                    {imageLoaded && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {fileInfo.fileName}
                            {fileInfo.size &&
                                ` • ${formatFileSize(fileInfo.size)}`}
                        </div>
                    )}
                </div>
            );
        }

        // Render audio file with clean interface
        if (isAudio()) {
            const { icon, color } = getFileIconAndColor();

            return (
                <div className="mt-2 max-w-md">
                    <div
                        className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                        onClick={handleClick}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
                            >
                                {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {fileInfo.fileName}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="uppercase font-medium">
                                        {fileInfo.extension}
                                    </span>
                                    {fileInfo.size && (
                                        <>
                                            <span>•</span>
                                            <span>
                                                {formatFileSize(fileInfo.size)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="text-gray-400 dark:text-gray-500">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Simple audio player */}
                        <audio
                            controls
                            className="w-full h-8"
                            preload="metadata"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <source
                                src={fileInfo.url}
                                type={
                                    fileInfo.type ||
                                    `audio/${fileInfo.extension}`
                                }
                            />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>
            );
        }

        // Render other file types
        const { icon, color } = getFileIconAndColor();

        return (
            <div
                className="mt-2 max-w-md p-3 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors duration-200"
                onClick={handleClick}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
                    >
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {fileInfo.fileName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="uppercase font-medium">
                                {fileInfo.extension}
                            </span>
                            {fileInfo.size && (
                                <>
                                    <span>•</span>
                                    <span>{formatFileSize(fileInfo.size)}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }
);

FilePreview.displayName = "FilePreview";

export default FilePreview;
