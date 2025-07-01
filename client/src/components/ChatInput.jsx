import { useState, useEffect, useRef } from "react";

export default function ChatInput({
    onSend,
    isLoading,
    onFileUpload,
    onVoiceRecord,
}) {
    const [message, setMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const recordingIntervalRef = useRef(null);
    const mediaRecorderRef = useRef(null);

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

    // File upload handling
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.map((file) => ({
            id: Date.now() + Math.random(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        // Call parent callback if provided
        if (onFileUpload) {
            onFileUpload(newFiles);
        }
    };

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

    return (
        <div className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="max-w-4xl mx-auto">
                {/* File attachments preview */}
                {uploadedFiles.length > 0 && (
                    <div className="mb-3 space-y-2">
                        {uploadedFiles.map((fileData) => (
                            <div
                                key={fileData.id}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border"
                            >
                                <div className="flex-shrink-0">
                                    {fileData.type.startsWith("image/") ? (
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
                                    ) : (
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
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {fileData.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(fileData.size)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFile(fileData.id)}
                                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
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
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    {/* Main input container */}
                    <div className="relative bg-white rounded-3xl border border-gray-300 shadow-sm mb-3">
                        {/* Textarea */}
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
                            className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 resize-none overflow-hidden text-base leading-relaxed px-5 py-4"
                            style={{
                                minHeight: "56px",
                                maxHeight: "200px",
                                paddingRight: isRecording ? "150px" : "120px",
                            }}
                            disabled={isLoading || isRecording}
                        />

                        {/* Recording indicator */}
                        {isRecording && (
                            <div className="absolute right-28 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-red-500 text-sm">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span>
                                    Recording {formatTime(recordingTime)}
                                </span>
                            </div>
                        )}

                        {/* Right side buttons */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                            {/* File upload button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
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
                                    isRecording ? stopRecording : startRecording
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

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="*/*"
                    />
                </div>

                {/* Disclaimer text */}
                <p className="text-xs text-gray-500 text-center">
                    AHA can make mistakes. Please double-check responses.
                </p>
            </div>
        </div>
    );
}
