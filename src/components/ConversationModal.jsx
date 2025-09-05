import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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

    const modalContent = (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 99999 }}
            onClick={handleBackdropClick}
        >
            <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-700 w-full max-w-md mx-auto">
                <div className="p-6" onClick={(e) => e.stopPropagation()}>
                    {type === "rename" ? (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Rename Conversation
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Update the name for this conversation
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Conversation Name
                                    </label>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) =>
                                            setInputValue(e.target.value)
                                        }
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-4 py-3 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg border border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                        placeholder="Enter conversation name..."
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-neutral-600 transition-all duration-200 font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={
                                            isLoading || !inputValue.trim()
                                        }
                                        className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2 justify-center">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Saving...
                                            </span>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : type === "delete" ? (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-red-600 dark:text-red-400"
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
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Delete Conversation
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg">
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                        Are you sure you want to delete this
                                        conversation? All messages and data will
                                        be permanently removed and cannot be
                                        recovered.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-neutral-600 transition-all duration-200 font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2 justify-center">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Deleting...
                                            </span>
                                        ) : (
                                            "Delete Permanently"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ConversationModal;
