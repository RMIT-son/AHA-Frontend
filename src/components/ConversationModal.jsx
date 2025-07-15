import React, { useState, useEffect } from "react";

const ConversationModal = ({
    isOpen,
    onClose,
    type, // 'rename' or 'delete'
    chatName = "",
    onRename,
    onDelete,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Initialize input value when modal opens for rename
    useEffect(() => {
        if (isOpen && type === "rename") {
            setInputValue(chatName);
        }
    }, [isOpen, type, chatName]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isOpen, onClose]);

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSave = async () => {
        if (type === "rename" && inputValue.trim()) {
            setIsLoading(true);
            try {
                await onRename(inputValue.trim());
                onClose();
            } catch (error) {
                console.error("Error renaming chat:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await onDelete();
            onClose();
        } catch (error) {
            console.error("Error deleting chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && type === "rename") {
            handleSave();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {type === "rename" ? (
                    <>
                        <h2 className="text-xl font-medium text-white mb-4">
                            Rename chat
                        </h2>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter chat name..."
                            autoFocus
                        />
                        <div className="flex gap-3 mt-6 justify-end">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading || !inputValue.trim()}
                                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </>
                ) : type === "delete" ? (
                    <>
                        <h2 className="text-xl font-medium text-white mb-2">
                            Delete chat?
                        </h2>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete this chat?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isLoading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default ConversationModal;
