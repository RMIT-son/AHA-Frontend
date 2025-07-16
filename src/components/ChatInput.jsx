import { useState, useEffect, useRef } from "react";

export default function ChatInput({ onSend, isLoading }) {
    const [message, setMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const recordingIntervalRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const inputBubbleRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((!message.trim() && uploadedFiles.length === 0) || isLoading)
            return;

        // Pass both message and files to parent
        onSend(message, uploadedFiles);
        setMessage("");
        setUploadedFiles([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                200
            )}px`;
        }
    }, [message]);

    // File validation - Images only
    const validateFile = (file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",
        ];

        if (file.size > maxSize) {
            return { valid: false, error: `Image size must be less than 10MB` };
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Only image files are supported (JPEG, PNG, GIF, WebP, SVG)`,
            };
        }

        return { valid: true };
    };

    // Process files - Only 1 image allowed
    const processFiles = (files) => {
        // Only process the first file
        const file = files[0];
        if (!file) return;

        const validation = validateFile(file);
        if (validation.valid) {
            const fileData = {
                id: Date.now() + Math.random(),
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                preview: null,
            };

            // Create preview for image
            const reader = new FileReader();
            reader.onload = (e) => {
                // Update the file data with preview
                setUploadedFiles([{ ...fileData, preview: e.target.result }]);
            };
            reader.readAsDataURL(file);

            // Set initial file data without preview (will be updated when reader finishes)
            setUploadedFiles([fileData]);

            if (onFileUpload) {
                onFileUpload([fileData]);
            }
        } else {
            alert(`Upload error: ${validation.error}`);
        }
    };

    // File upload handling
    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
    };

    // Handle file upload button click
    const handleFileUploadClick = () => {
        // Reset the input value before opening to ensure onChange always fires
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    };

    // Improved drag and drop handlers - only for the input bubble
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Drag enter detected", e.dataTransfer.types);

        // Check if files are being dragged
        if (e.dataTransfer.types.includes("Files")) {
            setIsDragOver(true);
            console.log("Setting drag over to true");
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Drag leave detected");

        // Only set dragOver to false if we're leaving the input bubble entirely
        if (
            inputBubbleRef.current &&
            !inputBubbleRef.current.contains(e.relatedTarget)
        ) {
            setIsDragOver(false);
            console.log("Setting drag over to false");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Keep the drag over state active while over the input bubble
        if (e.dataTransfer.types.includes("Files")) {
            if (!isDragOver) {
                setIsDragOver(true);
                console.log("Setting drag over to true from dragover");
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Drop detected", e.dataTransfer.files);
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            console.log("Processing dropped files:", files);
            processFiles(files);
        }
    };

    // Handle clipboard paste for images
    const handlePaste = (e) => {
        console.log("Paste detected", e.clipboardData.items);

        const items = e.clipboardData.items;
        const files = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf("image") !== -1) {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                    console.log("Image file found in clipboard:", file);
                }
            }
        }

        // Only interfere with paste if we found image files
        if (files.length > 0) {
            console.log("Processing pasted files:", files);
            processFiles(files);
            // Prevent default paste behavior only when processing images
            e.preventDefault();
            e.stopPropagation();
        }
        // If no image files found, let the normal paste behavior continue
    };

    // Setup drag and drop + paste event listeners
    useEffect(() => {
        const inputBubble = inputBubbleRef.current;

        if (inputBubble) {
            // Drag and drop events
            inputBubble.addEventListener("dragenter", handleDragEnter);
            inputBubble.addEventListener("dragleave", handleDragLeave);
            inputBubble.addEventListener("dragover", handleDragOver);
            inputBubble.addEventListener("drop", handleDrop);

            // Only add paste to the input bubble (not document and not textarea)
            inputBubble.addEventListener("paste", handlePaste);

            return () => {
                // Cleanup drag and drop
                inputBubble.removeEventListener("dragenter", handleDragEnter);
                inputBubble.removeEventListener("dragleave", handleDragLeave);
                inputBubble.removeEventListener("dragover", handleDragOver);
                inputBubble.removeEventListener("drop", handleDrop);

                // Cleanup paste
                inputBubble.removeEventListener("paste", handlePaste);
            };
        }
    }, []);

    const removeFile = (fileId) => {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    };

    // Voice recording handling
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const audioChunks = [];
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                if (onVoiceRecord) {
                    onVoiceRecord(audioBlob);
                }
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);

            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

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

    return (
        <div className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="max-w-4xl mx-auto">
                <div className="relative">
                    {/* Main input container - CLAUDE STYLE */}
                    <div
                        ref={inputBubbleRef}
                        className={`relative bg-white rounded-3xl border border-gray-300 shadow-sm transition-colors duration-200 ${
                            isDragOver ? "border-orange-400 bg-orange-50" : ""
                        }`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{ minHeight: "60px" }}
                    >
                        {/* Drag overlay - Enhanced visibility */}
                        {isDragOver && (
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/98 via-orange-50/95 to-amber-50/98 backdrop-blur-sm border-2 border-dashed border-orange-400 rounded-3xl flex items-center justify-center z-50">
                                <div className="text-center p-6">
                                    <div className="relative mb-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg transform transition-transform duration-300 hover:scale-110">
                                            <svg
                                                className="w-8 h-8 text-white animate-bounce"
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
                                        </div>
                                        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-orange-300 mx-auto animate-ping opacity-75"></div>
                                    </div>
                                    <p className="text-xl font-bold text-gray-800 mb-2">
                                        Drop files here to upload
                                    </p>
                                    <p className="text-gray-600 mb-3">
                                        Images, PDFs, and text files supported
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        You can also paste images with Ctrl+V
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Content container */}
                        <div className="relative">
                            {/* Textarea - at the top */}
                            <textarea
                                ref={textareaRef}
                                rows="1"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    isRecording
                                        ? "Recording..."
                                        : "How can I help you today?"
                                }
                                className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 resize-none overflow-hidden text-base leading-relaxed px-5 py-4 pb-2"
                                style={{
                                    minHeight: "56px",
                                    maxHeight: "200px",
                                    paddingRight: isRecording
                                        ? "150px"
                                        : "120px",
                                }}
                                disabled={isLoading || isRecording}
                                tabIndex={0}
                            />

                            {/* File attachments preview - INSIDE bubble, BELOW textarea */}
                            {uploadedFiles.length > 0 && (
                                <div className="px-5 pb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {uploadedFiles.map((fileData) => (
                                            <div
                                                key={fileData.id}
                                                className="relative group"
                                            >
                                                {fileData.preview ? (
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                        <img
                                                            src={
                                                                fileData.preview
                                                            }
                                                            alt={fileData.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            onClick={() =>
                                                                removeFile(
                                                                    fileData.id
                                                                )
                                                            }
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                                                            {getFileIcon(
                                                                fileData.type
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-gray-900 truncate max-w-16">
                                                                {fileData.name}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                removeFile(
                                                                    fileData.id
                                                                )
                                                            }
                                                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
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
                            )}

                            {/* Recording indicator */}
                            {isRecording && (
                                <div className="absolute right-28 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-red-500 text-sm">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span>
                                        Recording {formatTime(recordingTime)}
                                    </span>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="absolute right-3 top-4 flex items-center gap-1">
                                {/* File upload button */}
                                <button
                                    type="button"
                                    onClick={handleFileUploadClick}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                    title="Attach file"
                                    disabled={isLoading}
                                >
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
                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                        />
                                    </svg>
                                </button>

                                {/* Voice recording button */}
                                <button
                                    type="button"
                                    onClick={
                                        isRecording
                                            ? stopRecording
                                            : startRecording
                                    }
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        isRecording
                                            ? "bg-red-500 text-white animate-pulse"
                                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                    }`}
                                    title={
                                        isRecording
                                            ? "Stop recording"
                                            : "Start voice recording"
                                    }
                                    disabled={isLoading}
                                >
                                    {isRecording ? (
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M6 6h12v12H6z" />
                                        </svg>
                                    ) : (
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
                                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                            />
                                        </svg>
                                    )}
                                </button>

                                {/* Send button */}
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        (message.trim() ||
                                            uploadedFiles.length > 0) &&
                                        !isLoading &&
                                        !isRecording
                                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                    disabled={
                                        (!message.trim() &&
                                            uploadedFiles.length === 0) ||
                                        isLoading ||
                                        isRecording
                                    }
                                    title="Send message"
                                >
                                    {isLoading ? (
                                        <svg
                                            className="animate-spin w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    ) : (
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
                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,application/pdf,text/plain,application/json,text/csv"
                    />
                </div>
            </div>
        </div>
    );
}
