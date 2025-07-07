import { useState, useRef, useEffect } from "react";

export default function ImageUploader({
    onFileSelect,
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    className = "",
    showPreview = true,
    multiple = true,
}) {
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);
    const [errors, setErrors] = useState([]);

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const validateFile = (file) => {
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size must be less than ${formatFileSize(maxSize)}`,
            };
        }

        if (!acceptedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `File type ${file.type} is not supported`,
            };
        }

        return { valid: true };
    };

    const processFiles = (files) => {
        const validFiles = [];
        const newErrors = [];

        // Check if we'll exceed max files
        if (uploadedImages.length + files.length > maxFiles) {
            newErrors.push(`Cannot upload more than ${maxFiles} files`);
            return;
        }

        Array.from(files).forEach((file) => {
            const validation = validateFile(file);
            if (validation.valid) {
                const fileData = {
                    id: Date.now() + Math.random(),
                    file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    preview: null,
                    uploadProgress: 0,
                    status: "pending", // pending, uploading, success, error
                };

                // Create preview for images
                if (file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setUploadedImages((prev) =>
                            prev.map((f) =>
                                f.id === fileData.id
                                    ? { ...f, preview: e.target.result }
                                    : f
                            )
                        );
                    };
                    reader.readAsDataURL(file);
                }

                validFiles.push(fileData);
            } else {
                newErrors.push(`${file.name}: ${validation.error}`);
            }
        });

        if (newErrors.length > 0) {
            setErrors((prev) => [...prev, ...newErrors]);
            // Clear errors after 5 seconds
            setTimeout(() => {
                setErrors([]);
            }, 5000);
        }

        if (validFiles.length > 0) {
            setUploadedImages((prev) => [...prev, ...validFiles]);
            if (onFileSelect) {
                onFileSelect(validFiles);
            }
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFiles(files);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => prev + 1);
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => prev - 1);
        if (dragCounter - 1 === 0) {
            setIsDragOver(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        setDragCounter(0);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
    };

    const removeImage = (imageId) => {
        setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    };

    const clearAll = () => {
        setUploadedImages([]);
        setErrors([]);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Setup drag and drop event listeners
    useEffect(() => {
        const dropZone = dropZoneRef.current;
        if (dropZone) {
            dropZone.addEventListener("dragenter", handleDragEnter);
            dropZone.addEventListener("dragleave", handleDragLeave);
            dropZone.addEventListener("dragover", handleDragOver);
            dropZone.addEventListener("drop", handleDrop);

            return () => {
                dropZone.removeEventListener("dragenter", handleDragEnter);
                dropZone.removeEventListener("dragleave", handleDragLeave);
                dropZone.removeEventListener("dragover", handleDragOver);
                dropZone.removeEventListener("drop", handleDrop);
            };
        }
    }, [dragCounter]);

    return (
        <div className={`w-full ${className}`}>
            {/* Error messages */}
            {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium">Upload errors:</span>
                    </div>
                    <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Upload area */}
            <div
                ref={dropZoneRef}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                    isDragOver
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                }`}
            >
                {/* Upload icon and text */}
                <div className="flex flex-col items-center">
                    <svg
                        className="w-12 h-12 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                        {isDragOver ? "Drop images here" : "Upload images"}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        Drag and drop images here, or click to select files
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        Select Images
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                        {acceptedTypes.join(", ")} • Max{" "}
                        {formatFileSize(maxSize)} • Up to {maxFiles} files
                    </p>
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept={acceptedTypes.join(",")}
                />
            </div>

            {/* Image previews */}
            {showPreview && uploadedImages.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Uploaded Images ({uploadedImages.length})
                        </h3>
                        <button
                            onClick={clearAll}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {uploadedImages.map((image) => (
                            <div key={image.id} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                    {image.preview ? (
                                        <img
                                            src={image.preview}
                                            alt={image.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
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
                                </div>

                                {/* Image info overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() =>
                                                removeImage(image.id)
                                            }
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            title="Remove image"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Image details */}
                                <div className="mt-2">
                                    <p
                                        className="text-sm font-medium text-gray-900 truncate"
                                        title={image.name}
                                    >
                                        {image.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(image.size)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
