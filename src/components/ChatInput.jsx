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
    // New prop for audio file upload
    onAudioFileUpload,
}) {
    const [message, setMessage] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showAudioUploadMenu, setShowAudioUploadMenu] = useState(false);

    const textareaRef = useRef(null);
    const audioFileInputRef = useRef(null);
    const audioMenuRef = useRef(null);

    // Constants
    const MAX_FILES = 4;

    // File uploader hook with file limit check and mode restrictions
    const {
        fileInputRef,
        inputBubbleRef,
        handleFileUploadClick,
        handleFileSelect: originalHandleFileSelect,
        getCurrentFileMode,
        getAcceptAttribute,
        getFileUploadTitle,
        hasAudioFiles,
        hasNonAudioFiles,
    } = FileUploader({
        uploadedFiles,
        setUploadedFiles,
        isDragOver,
        setIsDragOver,
        isDisabled: isLoading || isProcessing || isTranscribing,
        maxFiles: MAX_FILES,
    });

    // Wrapper for file selection with limit and mode checks
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

    // Handle audio file selection with mode restrictions
    const handleAudioFileSelect = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const audioFile = files[0];

        // Check if it's an audio file only
        const isAudioFile = audioFile.type.startsWith("audio/");
        const hasAudioExtension = /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(
            audioFile.name
        );

        if (!isAudioFile && !hasAudioExtension) {
            alert(
                "Please select an audio file (.mp3, .wav, .m4a, .aac, .ogg, .flac)"
            );
            return;
        }

        // Check file mode restrictions
        const currentMode = getCurrentFileMode();
        if (currentMode === "other") {
            alert(
                "You can only upload audio files when no other file types are uploaded. Remove other files first to upload audio files."
            );
            if (audioFileInputRef.current) {
                audioFileInputRef.current.value = "";
            }
            return;
        }

        // Check file limit
        if (uploadedFiles.length >= MAX_FILES) {
            alert(
                `You can only upload a maximum of ${MAX_FILES} files. You currently have ${uploadedFiles.length} file(s) uploaded.`
            );
            if (audioFileInputRef.current) {
                audioFileInputRef.current.value = "";
            }
            return;
        }

        // Create file object with ID for preview
        const fileWithId = {
            id: Date.now() + Math.random(), // Simple unique ID
            file: audioFile,
            name: audioFile.name,
            size: audioFile.size,
            type: audioFile.type,
            preview: null, // Audio files don't have image previews
            isAudio: true,
        };

        // Add to uploaded files for preview
        setUploadedFiles((prev) => [...prev, fileWithId]);

        // Call the audio file upload handler if provided
        if (onAudioFileUpload) {
            onAudioFileUpload(audioFile);
        }

        // Reset the input and close menu
        if (audioFileInputRef.current) {
            audioFileInputRef.current.value = "";
        }
        setShowAudioUploadMenu(false);
    };

    // Close audio menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                audioMenuRef.current &&
                !audioMenuRef.current.contains(event.target)
            ) {
                setShowAudioUploadMenu(false);
            }
        };

        if (showAudioUploadMenu) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showAudioUploadMenu]);

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

    // Check if audio upload is disabled due to mode restrictions
    const isAudioUploadDisabled = () => {
        return (
            isLoading ||
            isProcessing ||
            isTranscribing ||
            uploadedFiles.length >= MAX_FILES ||
            getCurrentFileMode() === "other"
        );
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
        <div className="border-t border-gray-200 bg-white px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="max-w-4xl mx-auto">
                <StreamingStatus
                    isStreaming={isStreaming}
                    onCancelStream={onCancelStream}
                />

                <TranscribingStatus isTranscribing={isTranscribing} />

                {/* File limit indicator */}
                {uploadedFiles.length >= MAX_FILES && (
                    <div className="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 sm:px-4 py-2">
                        <svg
                            className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
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
                        <span className="text-xs sm:text-sm text-amber-700 font-medium">
                            Maximum file limit reached ({MAX_FILES}/{MAX_FILES}
                            ). Remove a file to upload more.
                        </span>
                    </div>
                )}

                {/* File mode restriction indicator */}
                {getCurrentFileMode() === "audio" && (
                    <div className="mb-3 flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 sm:px-4 py-2">
                        <svg
                            className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5"
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
                        <span className="text-xs sm:text-sm text-purple-700 font-medium">
                            Audio mode active - Only audio files can be
                            uploaded. Remove audio files to upload other file
                            types.
                        </span>
                    </div>
                )}

                {getCurrentFileMode() === "other" && (
                    <div className="mb-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2">
                        <svg
                            className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
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
                        <span className="text-xs sm:text-sm text-blue-700 font-medium">
                            Document mode active - Only images, PDFs, and text
                            files can be uploaded. Remove other files to upload
                            audio files.
                        </span>
                    </div>
                )}

                <div className="relative">
                    <div
                        ref={inputBubbleRef}
                        className={`relative bg-white rounded-2xl sm:rounded-3xl border transition-colors duration-200 ${
                            webSearchEnabled
                                ? "border-blue-300 shadow-blue-100 shadow-sm"
                                : "border-gray-300 shadow-sm"
                        } ${
                            isDragOver ? "border-orange-400 bg-orange-50" : ""
                        }`}
                        style={{ minHeight: "56px" }}
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
                                className={`w-full bg-transparent outline-none text-gray-900 resize-none text-sm sm:text-base leading-relaxed px-4 sm:px-5 pt-3 sm:pt-4 ${
                                    webSearchEnabled
                                        ? "placeholder-blue-400"
                                        : "placeholder-gray-500"
                                }`}
                                style={{
                                    minHeight: "48px",
                                    maxHeight: "180px",
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
                                {/* Left side - Plus button and Research button */}
                                <div className="flex items-center justify-start gap-2">
                                    {/* Plus button with audio upload menu */}
                                    <div
                                        className="relative"
                                        ref={audioMenuRef}
                                    >
                                        <button
                                            onClick={() =>
                                                setShowAudioUploadMenu(
                                                    !showAudioUploadMenu
                                                )
                                            }
                                            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-gray-600 border border-gray-200 bg-gray-100 hover:bg-gray-150 transition-all duration-200"
                                            disabled={
                                                isLoading ||
                                                isProcessing ||
                                                isStreaming
                                            }
                                            title="More options"
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
                                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                />
                                            </svg>
                                        </button>

                                        {/* Audio upload dropdown menu */}
                                        {showAudioUploadMenu && (
                                            <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px] sm:min-w-[200px] z-50">
                                                <button
                                                    onClick={() =>
                                                        audioFileInputRef.current?.click()
                                                    }
                                                    disabled={isAudioUploadDisabled()}
                                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm hover:bg-gray-100 flex items-center gap-2 sm:gap-3 ${
                                                        isAudioUploadDisabled()
                                                            ? "text-gray-400 cursor-not-allowed"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    <svg
                                                        className="w-4 h-4 text-gray-500"
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
                                                    Upload Audio File
                                                    {getCurrentFileMode() ===
                                                        "other" && (
                                                        <span className="text-xs text-gray-400 hidden sm:inline">
                                                            (Disabled)
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Research button */}
                                    {enableWebSearch && (
                                        <button
                                            onClick={handleResearchClick}
                                            className={`
                                                flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border whitespace-nowrap
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
                                                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin flex-shrink-0"
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
                                                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors duration-200 flex-shrink-0 ${
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
                                <div className="flex items-center justify-end gap-1">
                                    {/* File upload button */}
                                    <button
                                        type="button"
                                        onClick={handleFileUploadClick}
                                        className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
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
                                        className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${buttonState.buttonColor}`}
                                        disabled={buttonState.disabled}
                                        title={buttonState.buttonText}
                                    >
                                        {isLoading || isProcessing ? (
                                            <svg
                                                className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                                                className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                                                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                                                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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

                    {/* Hidden file inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                        accept={getAcceptAttribute()}
                    />

                    {/* Hidden audio file input */}
                    <input
                        ref={audioFileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleAudioFileSelect}
                        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                    />
                </div>
            </div>
        </div>
    );
}
