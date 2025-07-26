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

    // File validation - Images, PDFs, text files, CSVs
    const validateFile = (file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
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
        ];

        if (file.size > maxSize) {
            return { valid: false, error: `File size must be less than 10MB` };
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Only images, PDFs, text files, and CSVs are supported`,
            };
        }

        return { valid: true };
    };

    // Process files with limit checking
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
                };

                // Create preview for images
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

    return {
        fileInputRef,
        inputBubbleRef,
        handleFileUploadClick,
        handleFileSelect,
    };
}
