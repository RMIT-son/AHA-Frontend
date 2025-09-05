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
    enableWebSearch = false,
    onWebSearchToggle,
    webSearchEnabled = false,
    onAudioFileUpload,
}) {
    // State management
    const [message, setMessage] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showAudioUploadMenu, setShowAudioUploadMenu] = useState(false);

    // Refs
    const textareaRef = useRef(null);
    const audioFileInputRef = useRef(null);
    const audioMenuRef = useRef(null);

    // Constants
    const MAX_FILES = 4;

    // File uploader hook
    const {
        fileInputRef,
        inputBubbleRef,
        handleFileUploadClick,
        handleFileSelect: originalHandleFileSelect,
        getCurrentFileMode,
        getAcceptAttribute,
        getFileUploadTitle,
    } = FileUploader({
        uploadedFiles,
        setUploadedFiles,
        isDragOver,
        setIsDragOver,
        isDisabled: isLoading || isProcessing || isTranscribing,
        maxFiles: MAX_FILES,
    });

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

    // File selection handler with validation
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

    // Audio file selection handler
    const handleAudioFileSelect = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const audioFile = files[0];
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

        if (uploadedFiles.length >= MAX_FILES) {
            alert(
                `You can only upload a maximum of ${MAX_FILES} files. You currently have ${uploadedFiles.length} file(s) uploaded.`
            );
            if (audioFileInputRef.current) {
                audioFileInputRef.current.value = "";
            }
            return;
        }

        const fileWithId = {
            id: Date.now() + Math.random(),
            file: audioFile,
            name: audioFile.name,
            size: audioFile.size,
            type: audioFile.type,
            preview: null,
            isAudio: true,
        };

        setUploadedFiles((prev) => [...prev, fileWithId]);

        if (audioFileInputRef.current) {
            audioFileInputRef.current.value = "";
        }
        setShowAudioUploadMenu(false);
    };

    // Handle transcribed text
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

    // Event handlers
    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            (!message.trim() && uploadedFiles.length === 0) ||
            isLoading ||
            isProcessing
        ) {
            return;
        }

        onSend(message, uploadedFiles, { webSearchEnabled });
        setMessage("");
        setUploadedFiles([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (isProcessing || isLoading) return;
            handleSubmit(e);
        }
        if (e.key === "Escape" && isStreaming) {
            e.preventDefault();
            onCancelStream?.();
        }
    };

    const removeFile = (fileId) => {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    };

    // Utility functions
    const isFileUploadDisabled = () => {
        return (
            isLoading ||
            isProcessing ||
            isTranscribing ||
            uploadedFiles.length >= MAX_FILES
        );
    };

    const isAudioUploadDisabled = () => {
        return (
            isLoading ||
            isProcessing ||
            isTranscribing ||
            uploadedFiles.length >= MAX_FILES ||
            getCurrentFileMode() === "other"
        );
    };

    const getPlaceholderText = () => {
        if (isRecording) return "Recording...";
        if (isTranscribing) return "Transcribing voice...";
        if (isProcessing) return "Processing your message...";
        if (isStreaming)
            return "AI is responding... (Press Escape or send to interrupt)";
        return "How can I help you today?";
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
                buttonColor:
                    "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
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
        <div className="border-t border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-4">
            <div className="max-w-4xl mx-auto">
                <StreamingStatus
                    isStreaming={isStreaming}
                    onCancelStream={onCancelStream}
                />
                <TranscribingStatus isTranscribing={isTranscribing} />

                {/* File limit indicator */}
                {uploadedFiles.length >= MAX_FILES && (
                    <div className="mb-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-2">
                        <svg
                            className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
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
                        <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                            Maximum file limit reached ({MAX_FILES}/{MAX_FILES}
                            ). Remove a file to upload more.
                        </span>
                    </div>
                )}

                {/* File mode indicators */}
                {getCurrentFileMode() === "audio" && (
                    <div className="mb-3 flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg px-4 py-2">
                        <svg
                            className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5"
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
                        <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                            Audio mode active - Only audio files can be
                            uploaded.
                        </span>
                    </div>
                )}

                {getCurrentFileMode() === "other" && (
                    <div className="mb-3 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2">
                        <svg
                            className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
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
                        <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                            Document mode active - Only images, PDFs, and text
                            files can be uploaded.
                        </span>
                    </div>
                )}

                {/* Main input container */}
                <div className="relative">
                    <div
                        ref={inputBubbleRef}
                        className={`relative bg-white dark:bg-neutral-900 rounded-2xl border transition-all duration-200 ${
                            webSearchEnabled
                                ? "border-blue-300 shadow-blue-100 shadow-sm dark:border-blue-500/70"
                                : "border-gray-300 dark:border-neutral-700 shadow-sm"
                        } ${
                            isDragOver
                                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                                : ""
                        }`}
                    >
                        <DragOverlay isDragOver={isDragOver} />

                        <div className="relative">
                            {/* Text input */}
                            <textarea
                                ref={textareaRef}
                                rows="1"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={getPlaceholderText()}
                                className={`w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 resize-none text-base leading-relaxed px-5 pt-4 ${
                                    webSearchEnabled
                                        ? "placeholder-blue-400 dark:placeholder-blue-300"
                                        : "placeholder-gray-500 dark:placeholder-gray-400"
                                }`}
                                style={{
                                    minHeight: "48px",
                                    maxHeight: "180px",
                                }}
                                tabIndex={0}
                            />

                            <RecordingIndicator
                                isRecording={isRecording}
                                recordingTime={recordingTime}
                                formatTime={formatTime}
                            />

                            {/* Bottom controls */}
                            <div className="pb-4 flex items-center justify-between px-5">
                                {/* Left side - Additional options */}
                                <div className="flex items-center gap-2">
                                    {/* Audio upload menu */}
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
                                            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-150 dark:hover:bg-neutral-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

                                        {/* Audio upload dropdown */}
                                        {showAudioUploadMenu && (
                                            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 min-w-[180px] z-50">
                                                <button
                                                    onClick={() =>
                                                        audioFileInputRef.current?.click()
                                                    }
                                                    disabled={isAudioUploadDisabled()}
                                                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-3 ${
                                                        isAudioUploadDisabled()
                                                            ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                                            : "text-gray-700 dark:text-gray-200"
                                                    }`}
                                                >
                                                    <svg
                                                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                                            (Disabled)
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Web search toggle */}
                                    {enableWebSearch && (
                                        <button
                                            onClick={onWebSearchToggle}
                                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                                webSearchEnabled
                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-150"
                                                    : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:bg-gray-150 dark:hover:bg-neutral-700"
                                            }`}
                                            disabled={
                                                isLoading ||
                                                isProcessing ||
                                                isStreaming
                                            }
                                            title={
                                                webSearchEnabled
                                                    ? "Web search enabled - Click to disable"
                                                    : "Click to enable web search"
                                            }
                                        >
                                            <svg
                                                className={`w-3.5 h-3.5 ${
                                                    webSearchEnabled
                                                        ? "text-blue-600"
                                                        : "text-gray-500 dark:text-gray-400"
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="M21 21l-4.35-4.35" />
                                            </svg>
                                            <span>Research</span>
                                        </button>
                                    )}
                                </div>

                                {/* Right side - Action buttons */}
                                <div className="flex items-center gap-1">
                                    {/* File upload button */}
                                    <button
                                        type="button"
                                        onClick={handleFileUploadClick}
                                        className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                            isFileUploadDisabled()
                                                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                                : "text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
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
                                        className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${buttonState.buttonColor}`}
                                        disabled={buttonState.disabled}
                                        title={buttonState.buttonText}
                                    >
                                        {isLoading ||
                                        isProcessing ||
                                        isTranscribing ? (
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
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12a10 10 0 0110-10v4a6 6 0 00-6 6H2z"
                                                />
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

                            {/* File preview */}
                            {uploadedFiles.length > 0 && (
                                <div className="px-5">
                                    <FilePreview
                                        uploadedFiles={uploadedFiles}
                                        removeFile={removeFile}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hidden file inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                        accept={getAcceptAttribute()}
                    />

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
