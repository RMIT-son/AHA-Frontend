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

export default function MobileChatInput({
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
    const [message, setMessage] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showControls, setShowControls] = useState(false);

    const textareaRef = useRef(null);
    const audioFileInputRef = useRef(null);
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

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const totalFiles = uploadedFiles.length + files.length;
        if (totalFiles > MAX_FILES) {
            alert(`You can only upload a maximum of ${MAX_FILES} files.`);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }
        originalHandleFileSelect(e);
    };

    const handleAudioFileSelect = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const audioFile = files[0];
        const isAudioFile = audioFile.type.startsWith("audio/");
        const hasAudioExtension = /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(audioFile.name);

        if (!isAudioFile && !hasAudioExtension) {
            alert("Please select an audio file (.mp3, .wav, .m4a, .aac, .ogg, .flac)");
            return;
        }

        const currentMode = getCurrentFileMode();
        if (currentMode === "other") {
            alert("Remove other files first to upload audio files.");
            if (audioFileInputRef.current) {
                audioFileInputRef.current.value = "";
            }
            return;
        }

        if (uploadedFiles.length >= MAX_FILES) {
            alert(`Max ${MAX_FILES} files allowed.`);
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
        setShowControls(false);
    };

    // Handle transcribed text
    useEffect(() => {
        if (transcribedText && transcribedText.trim()) {
            setMessage((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
            if (textareaRef.current) {
                textareaRef.current.focus();
                setTimeout(() => {
                    const textarea = textareaRef.current;
                    if (textarea) {
                        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
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
            const maxHeight = 80; // Max 80px on mobile
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                maxHeight
            )}px`;
        }
    }, [message]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((!message.trim() && uploadedFiles.length === 0) || isLoading || isProcessing) {
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

    const getPlaceholderText = () => {
        if (isRecording) return "Recording...";
        if (isTranscribing) return "Transcribing...";
        if (isProcessing) return "Processing...";
        if (isStreaming) return "AI responding... (Tap to interrupt)";
        return "How can I help you today?";
    };

    const canSubmit = (message.trim() || uploadedFiles.length > 0) && canSend && !isRecording && !isLoading && !isProcessing;

    return (
        <div className="border-t border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2">
            <StreamingStatus isStreaming={isStreaming} onCancelStream={onCancelStream} />
            <TranscribingStatus isTranscribing={isTranscribing} />

            {/* Compact status indicators */}
            {uploadedFiles.length >= MAX_FILES && (
                <div className="mb-1 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded p-1">
                    <svg className="w-3 h-3 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-xs text-amber-700 font-medium">Max files reached</span>
                </div>
            )}

            <div className="relative">
                <div
                    ref={inputBubbleRef}
                    className={`relative bg-white dark:bg-neutral-900 rounded-xl border transition-colors ${
                        webSearchEnabled
                            ? "border-blue-300 dark:border-blue-500"
                            : "border-gray-300 dark:border-neutral-700"
                    } ${isDragOver ? "border-emerald-400 bg-emerald-50" : ""}`}
                >
                    <DragOverlay isDragOver={isDragOver} />

                    {/* Main input area */}
                    <div className="flex items-end gap-2 p-2">
                        {/* Textarea container */}
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                rows="1"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={getPlaceholderText()}
                                className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 resize-none text-base leading-tight placeholder-gray-500 dark:placeholder-gray-400"
                                style={{
                                    minHeight: "24px",
                                    maxHeight: "80px",
                                }}
                                disabled={isLoading || isProcessing}
                            />
                            <RecordingIndicator
                                isRecording={isRecording}
                                recordingTime={recordingTime}
                                formatTime={formatTime}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                            {/* Controls toggle */}
                            <button
                                onClick={() => setShowControls(!showControls)}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-neutral-800"
                                disabled={isLoading || isProcessing}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>

                            {/* Voice button */}
                            <VoiceButton />

                            {/* Send button */}
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className={`p-2 rounded-lg transition-all ${
                                    canSubmit
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                                disabled={!canSubmit}
                            >
                                {isLoading || isProcessing || isTranscribing ? (
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12a10 10 0 0110-10v4a6 6 0 00-6 6H2z" />
                                    </svg>
                                ) : isStreaming ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10l2 2 4-4" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Expanded controls */}
                    {showControls && (
                        <div className="border-t border-gray-200 dark:border-neutral-700 p-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {/* File upload */}
                                    <button
                                        onClick={handleFileUploadClick}
                                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
                                        disabled={uploadedFiles.length >= MAX_FILES}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <span>Files</span>
                                    </button>

                                    {/* Audio upload */}
                                    <button
                                        onClick={() => audioFileInputRef.current?.click()}
                                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
                                        disabled={uploadedFiles.length >= MAX_FILES || getCurrentFileMode() === "other"}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 12.464a9 9 0 010-8.928M12 19V5M8.464 12.464a9 9 0 010-8.928" />
                                        </svg>
                                        <span>Audio</span>
                                    </button>
                                </div>

                                {/* Web search toggle */}
                                {enableWebSearch && (
                                    <button
                                        onClick={onWebSearchToggle}
                                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg ${
                                            webSearchEnabled
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="M21 21l-4.35-4.35" />
                                        </svg>
                                        <span>Search</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* File preview */}
                    {uploadedFiles.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-neutral-700 p-2">
                            <FilePreview uploadedFiles={uploadedFiles} removeFile={removeFile} />
                        </div>
                    )}
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
    );
}