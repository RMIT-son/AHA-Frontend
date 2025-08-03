import { useState, useEffect, useRef } from "react";
import {
    FileUploader,
    FilePreview,
    VoiceRecorder,
    StreamingStatus,
    TranscribingStatus,
    RecordingIndicator,
    DragOverlay,
} from "./index";

export default function ChatInput({
    onSend,
    onVoiceRecord,
    isLoading,
    canSend = true,
    isStreaming = false,
    onCancelStream,
    isProcessing = false,
    transcribedText = "",
    onTranscribedTextUsed,
    isTranscribing = false,
    // New props for web search
    enableWebSearch = false,
    onWebSearchToggle,
    webSearchEnabled = false,
}) {
    const [message, setMessage] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const textareaRef = useRef(null);

    // Constants
    const MAX_FILES = 4;

    // File uploader hook with file limit check
    const {
        fileInputRef,
        inputBubbleRef,
        handleFileUploadClick,
        handleFileSelect: originalHandleFileSelect,
    } = FileUploader({
        uploadedFiles,
        setUploadedFiles,
        isDragOver,
        setIsDragOver,
        isDisabled: isLoading || isProcessing || isTranscribing,
        maxFiles: MAX_FILES,
    });

    // Wrapper for file selection with limit check
    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const totalFiles = uploadedFiles.length + files.length;
        if (totalFiles > MAX_FILES) {
            alert(
                `You can only upload a maximum of ${MAX_FILES} files. You currently have ${uploadedFiles.length} file(s) uploaded.`
            );
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        originalHandleFileSelect(e);
    };

    // Voice recorder hook
    const {
        isRecording,
        recordingTime,
        startRecording,
        stopRecording,
        formatTime,
        VoiceButton,
    } = VoiceRecorder({
        onVoiceRecord,
        isTranscribing,
        isDisabled: isLoading || isProcessing,
    });

    // Handle transcribed text updates
    useEffect(() => {
        if (transcribedText && transcribedText.trim()) {
            setMessage((prev) => {
                const newMessage = prev
                    ? `${prev} ${transcribedText}`
                    : transcribedText;
                return newMessage;
            });

            if (textareaRef.current) {
                textareaRef.current.focus();
                setTimeout(() => {
                    const textarea = textareaRef.current;
                    if (textarea) {
                        textarea.setSelectionRange(
                            textarea.value.length,
                            textarea.value.length
                        );
                    }
                }, 0);
            }

            if (onTranscribedTextUsed) {
                onTranscribedTextUsed();
            }
        }
    }, [transcribedText, onTranscribedTextUsed]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            (!message.trim() && uploadedFiles.length === 0) ||
            isLoading ||
            isProcessing
        ) {
            return;
        }

        // Pass web search state along with the message
        onSend(message, uploadedFiles, { webSearchEnabled });
        setMessage("");
        setUploadedFiles([]);
        // Clear search results when sending
        setSearchResults([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (isProcessing || isLoading) {
                return;
            }
            handleSubmit(e);
        }
        if (e.key === "Escape" && isStreaming) {
            e.preventDefault();
            onCancelStream?.();
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

    const removeFile = (fileId) => {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    };

    // Check if file upload is disabled due to limit
    const isFileUploadDisabled = () => {
        return (
            isLoading ||
            isProcessing ||
            isTranscribing ||
            uploadedFiles.length >= MAX_FILES
        );
    };

    // Get file upload button title
    const getFileUploadTitle = () => {
        if (uploadedFiles.length >= MAX_FILES) {
            return `Maximum ${MAX_FILES} files allowed`;
        }
        return `Attach file (${uploadedFiles.length}/${MAX_FILES})`;
    };

    // Determine placeholder text and button state
    const getPlaceholderText = () => {
        if (isRecording) return "Recording...";
        if (isTranscribing) return "Transcribing voice...";
        if (isProcessing) return "Processing your message...";
        if (isStreaming)
            return "AI is responding... (Press Escape or send to interrupt)";
        return "How can I help you today?";
    };

    // Fixed research functionality
    const handleResearch = async () => {
        if (!message.trim() || !conversationId) return;

        setIsSearching(true);
        setSearchResults([]);

        try {
            await streamWebSearch(conversationId, message, (chunk) => {
                setSearchResults((prev) => [...prev, chunk]);
            });
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleResearchClick = async () => {
        if (!webSearchEnabled) {
            // Enable web search first
            onWebSearchToggle();
            // Then perform search if there's a message
            if (message.trim()) {
                await handleResearch();
            }
        } else {
            // Disable web search
            onWebSearchToggle();
            // Clear search results
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const getInputButtonState = () => {
        if (isTranscribing) {
            return {
                canSend: false,
                buttonText: "Transcribing...",
                buttonColor: "bg-blue-200 text-blue-600 cursor-not-allowed",
                disabled: true,
            };
        }

        if (isProcessing) {
            return {
                canSend: false,
                buttonText: "Processing...",
                buttonColor: "bg-gray-200 text-gray-400 cursor-not-allowed",
                disabled: true,
            };
        }

        if (isStreaming) {
            return {
                canSend: true,
                buttonText: "Interrupt & Send",
                buttonColor: "bg-red-500 hover:bg-red-600 text-white",
                disabled: false,
            };
        }

        if (isLoading) {
            return {
                canSend: false,
                buttonText: "Loading...",
                buttonColor: "bg-gray-200 text-gray-400 cursor-not-allowed",
                disabled: true,
            };
        }

        if (
            (message.trim() || uploadedFiles.length > 0) &&
            canSend &&
            !isRecording
        ) {
            return {
                canSend: true,
                buttonText: "Send message",
                buttonColor: "bg-orange-500 hover:bg-orange-600 text-white",
                disabled: false,
            };
        }

        return {
            canSend: false,
            buttonText: "Send message",
            buttonColor: "bg-gray-200 text-gray-400 cursor-not-allowed",
            disabled: true,
        };
    };

    const buttonState = getInputButtonState();

    return (
        <div className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="max-w-4xl mx-auto">
                <StreamingStatus
                    isStreaming={isStreaming}
                    onCancelStream={onCancelStream}
                />

                <TranscribingStatus isTranscribing={isTranscribing} />

                {/* File limit indicator */}
                {uploadedFiles.length >= MAX_FILES && (
                    <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                        <svg
                            className="w-4 h-4 text-amber-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        <span className="text-sm text-amber-700 font-medium">
                            Maximum file limit reached ({MAX_FILES}/{MAX_FILES}
                            ). Remove a file to upload more.
                        </span>
                    </div>
                )}

                <div className="relative">
                    <div
                        ref={inputBubbleRef}
                        className={`relative bg-white rounded-3xl border transition-colors duration-200 ${
                            webSearchEnabled
                                ? "border-blue-300 shadow-blue-100 shadow-sm"
                                : "border-gray-300 shadow-sm"
                        } ${
                            isDragOver ? "border-orange-400 bg-orange-50" : ""
                        }`}
                        style={{ minHeight: "60px" }}
                    >
                        <DragOverlay isDragOver={isDragOver} />

                        <div className="relative">
                            {/* Main text input area */}
                            <textarea
                                ref={textareaRef}
                                rows="1"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={getPlaceholderText()}
                                className={`w-full bg-transparent outline-none text-gray-900 resize-none text-base leading-relaxed px-5 pt-4 ${
                                    webSearchEnabled
                                        ? "placeholder-blue-400"
                                        : "placeholder-gray-500"
                                }`}
                                style={{
                                    minHeight: "56px",
                                    maxHeight: "200px",
                                }}
                                disabled={
                                    isLoading ||
                                    isRecording ||
                                    isProcessing ||
                                    isTranscribing
                                }
                                tabIndex={0}
                            />

                            <RecordingIndicator
                                isRecording={isRecording}
                                recordingTime={recordingTime}
                                formatTime={formatTime}
                            />

                            {/* Bottom button row */}
                            <div className="pb-4 flex items-center justify-between px-4">
                                {/* Left side - Research button */}
                                <div className="flex items-center">
                                    {enableWebSearch && (
                                        <button
                                            onClick={handleResearchClick}
                                            className={`
                                                flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
                                                ${
                                                    webSearchEnabled
                                                        ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-150"
                                                        : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-150"
                                                }
                                            `}
                                            disabled={
                                                isLoading ||
                                                isProcessing ||
                                                isStreaming ||
                                                isSearching
                                            }
                                            title={
                                                webSearchEnabled
                                                    ? "Web search enabled - Click to disable"
                                                    : "Click to enable web search"
                                            }
                                        >
                                            {isSearching ? (
                                                <svg
                                                    className="w-3.5 h-3.5 animate-spin"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        fill="none"
                                                    />
                                                    <circle
                                                        className="opacity-75"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        fill="none"
                                                        strokeDasharray="31.416"
                                                        strokeDashoffset="23.562"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className={`w-3.5 h-3.5 transition-colors duration-200 ${
                                                        webSearchEnabled
                                                            ? "text-blue-600"
                                                            : "text-gray-500"
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        cx="11"
                                                        cy="11"
                                                        r="8"
                                                    />
                                                    <path d="M21 21l-4.35-4.35" />
                                                </svg>
                                            )}
                                            <span>
                                                {isSearching
                                                    ? "Searching..."
                                                    : "Research"}
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {/* Right side - Action buttons */}
                                <div className="flex items-center gap-1">
                                    {/* File upload button */}
                                    <button
                                        type="button"
                                        onClick={handleFileUploadClick}
                                        className={`p-2 rounded-lg transition-all duration-200 ${
                                            isFileUploadDisabled()
                                                ? "text-gray-300 cursor-not-allowed"
                                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                        }`}
                                        title={getFileUploadTitle()}
                                        disabled={isFileUploadDisabled()}
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
                                    <VoiceButton />

                                    {/* Send button */}
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        className={`p-2 rounded-lg transition-all duration-200 ${buttonState.buttonColor}`}
                                        disabled={buttonState.disabled}
                                        title={buttonState.buttonText}
                                    >
                                        {isLoading || isProcessing ? (
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
                                                    d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12a10 10 0 0110-10v4a6 6 0 00-6 6H2z"
                                                ></path>
                                            </svg>
                                        ) : isTranscribing ? (
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
                                                    d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12a10 10 0 0110-10v4a6 6 0 00-6 6H2z"
                                                ></path>
                                            </svg>
                                        ) : isStreaming ? (
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
                                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 10l2 2 4-4"
                                                />
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

                            {/* File Preview Row - Third line */}
                            {uploadedFiles.length > 0 && (
                                <div className="px-4">
                                    <FilePreview
                                        uploadedFiles={uploadedFiles}
                                        removeFile={removeFile}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Results Section */}
                    {isSearching && (
                        <div className="mt-3 flex items-center gap-2 text-gray-500 text-sm">
                            <svg
                                className="w-4 h-4 animate-spin"
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
                            <span>Searching the web...</span>
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <div className="text-sm text-gray-600 font-medium mb-2">
                                Search Results ({searchResults.length})
                            </div>
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                                >
                                    <a
                                        href={result.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 font-medium hover:underline text-sm"
                                    >
                                        {result.title}
                                    </a>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                        {result.snippet}
                                    </p>
                                    {result.url && (
                                        <p className="text-gray-400 text-xs mt-1 truncate">
                                            {result.url}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,application/pdf,text/plain,application/json,text/csv,audio/wav,audio/mpeg,.wav,.mp3"
                    />
                </div>
            </div>
        </div>
    );
}
