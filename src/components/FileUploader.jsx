import { useRef, useEffect } from "react";

export default function FileUploader({
    uploadedFiles,
    setUploadedFiles,
    isDragOver,
    setIsDragOver,
    isDisabled = false,
    maxFiles = 4,
}) {
    const fileInputRef = useRef(null);
    const inputBubbleRef = useRef(null);

    // Check if uploaded files contain audio files
    const hasAudioFiles = () => {
        return uploadedFiles.some((file) => file.type.startsWith("audio/"));
    };

    // Check if uploaded files contain non-audio files
    const hasNonAudioFiles = () => {
        return uploadedFiles.some((file) => !file.type.startsWith("audio/"));
    };

    // Get the current file mode (audio, other, or none)
    const getCurrentFileMode = () => {
        if (hasAudioFiles()) return "audio";
        if (hasNonAudioFiles()) return "other";
        return "none";
    };

    // File validation - Images, PDFs, text files, CSVs, Audio
    const validateFile = (file) => {
        const maxSize = 25 * 1024 * 1024; // 25MB
        const audioTypes = [
            "audio/wav",
            "audio/x-wav",
            "audio/mpeg",
            "audio/mp3",
            "audio/m4a",
            "audio/aac",
            "audio/ogg",
            "audio/flac",
        ];
        const otherAllowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",
            "application/pdf",
            "text/plain",
            "application/json",
            "text/csv",
            "application/csv",
            "text/tab-separated-values",
        ];

        if (file.size > maxSize) {
            return { valid: false, error: `File size must be less than 25MB` };
        }

        const isAudioFile =
            audioTypes.includes(file.type) ||
            /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name);
        const isOtherFile = otherAllowedTypes.includes(file.type);

        if (!isAudioFile && !isOtherFile) {
            return {
                valid: false,
                error: `File type not supported. Only audio files (mp3, wav, m4a, etc.) or other files (images, PDFs, text, CSV) are allowed`,
            };
        }

        // Check file mode restrictions
        const currentMode = getCurrentFileMode();

        if (currentMode === "audio" && !isAudioFile) {
            return {
                valid: false,
                error: `You can only upload audio files when audio files are already uploaded. Remove audio files first to upload other file types.`,
            };
        }

        if (currentMode === "other" && isAudioFile) {
            return {
                valid: false,
                error: `You can only upload other file types when non-audio files are already uploaded. Remove other files first to upload audio files.`,
            };
        }

        return { valid: true, isAudio: isAudioFile };
    };

    // Process files with limit checking and mode restrictions
    const processFiles = (files) => {
        const fileArray = Array.from(files);

        // Check if adding these files would exceed the limit
        const totalFiles = uploadedFiles.length + fileArray.length;
        if (totalFiles > maxFiles) {
            alert(
                `You can only upload a maximum of ${maxFiles} files. You currently have ${uploadedFiles.length} file(s) uploaded.`
            );
            return;
        }

        const validFiles = [];
        const errors = [];

        for (let file of fileArray) {
            const validation = validateFile(file);
            if (validation.valid) {
                const fileData = {
                    id: Date.now() + Math.random(),
                    file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    preview: null,
                    isAudio: validation.isAudio,
                };

                // Create preview for images only
                if (file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setUploadedFiles((prev) =>
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
                errors.push(`${file.name}: ${validation.error}`);
            }
        }

        if (errors.length > 0) {
            alert(`Upload errors:\n${errors.join("\n")}`);
        }

        if (validFiles.length > 0) {
            setUploadedFiles((prev) => [...prev, ...validFiles]);
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
        if (uploadedFiles.length >= maxFiles) {
            alert(
                `Maximum ${maxFiles} files allowed. Please remove some files first.`
            );
            return;
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    };

    // Drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes("Files")) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (
            inputBubbleRef.current &&
            !inputBubbleRef.current.contains(e.relatedTarget)
        ) {
            setIsDragOver(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes("Files")) {
            if (!isDragOver) {
                setIsDragOver(true);
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
    };

    // Handle clipboard paste for files
    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        const files = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf("image") !== -1) {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }

        if (files.length > 0) {
            processFiles(files);
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // Setup event listeners
    useEffect(() => {
        const inputBubble = inputBubbleRef.current;

        if (inputBubble) {
            inputBubble.addEventListener("dragenter", handleDragEnter);
            inputBubble.addEventListener("dragleave", handleDragLeave);
            inputBubble.addEventListener("dragover", handleDragOver);
            inputBubble.addEventListener("drop", handleDrop);
            inputBubble.addEventListener("paste", handlePaste);

            return () => {
                inputBubble.removeEventListener("dragenter", handleDragEnter);
                inputBubble.removeEventListener("dragleave", handleDragLeave);
                inputBubble.removeEventListener("dragover", handleDragOver);
                inputBubble.removeEventListener("drop", handleDrop);
                inputBubble.removeEventListener("paste", handlePaste);
            };
        }
    }, [uploadedFiles.length, maxFiles]);

    // Get dynamic accept attribute based on current file mode
    const getAcceptAttribute = () => {
        const currentMode = getCurrentFileMode();

        if (currentMode === "audio") {
            return "audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac";
        } else if (currentMode === "other") {
            return "image/*,application/pdf,text/plain,application/json,text/csv";
        } else {
            // No files uploaded yet, allow all
            return "image/*,application/pdf,text/plain,application/json,text/csv,audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac";
        }
    };

    // Get file upload button title with mode restrictions
    const getFileUploadTitle = () => {
        if (uploadedFiles.length >= maxFiles) {
            return `Maximum ${maxFiles} files allowed`;
        }

        const currentMode = getCurrentFileMode();
        const baseTitle = `Attach file (${uploadedFiles.length}/${maxFiles})`;

        if (currentMode === "audio") {
            return `${baseTitle} - Audio files only`;
        } else if (currentMode === "other") {
            return `${baseTitle} - Images, PDFs, text files only`;
        }

        return baseTitle;
    };

    return {
        fileInputRef,
        inputBubbleRef,
        handleFileUploadClick,
        handleFileSelect,
        getCurrentFileMode,
        getAcceptAttribute,
        getFileUploadTitle,
        hasAudioFiles,
        hasNonAudioFiles,
    };
}
