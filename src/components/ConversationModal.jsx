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
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            style={{
                zIndex: 99999,
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
            onClick={handleBackdropClick}
        >
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-md mx-auto overflow-hidden backdrop-blur-md">
                {/* Ambient background effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/5 to-teal-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/3 to-cyan-500/3 rounded-full blur-2xl" />
                </div>

                <div
                    className="relative p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {type === "rename" ? (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg
                                        className="w-5 h-5 text-white"
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
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                        Rename Consultation
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Update the name for this consultation
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Consultation Name
                                    </label>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) =>
                                            setInputValue(e.target.value)
                                        }
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-4 py-3 bg-slate-50/80 dark:bg-slate-700/60 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-xl border border-slate-200/60 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:focus:ring-blue-400/50 dark:focus:border-blue-400/50 transition-all duration-200 backdrop-blur-sm"
                                        placeholder="Enter consultation name..."
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-slate-100/80 dark:bg-slate-700/60 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 backdrop-blur-sm border border-slate-200/40 dark:border-slate-600/40"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={
                                            isLoading || !inputValue.trim()
                                        }
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
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
                                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg
                                        className="w-5 h-5 text-white"
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
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                        Delete Consultation
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 rounded-xl">
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                        Are you sure you want to delete this
                                        consultation? All messages and data will
                                        be permanently removed and cannot be
                                        recovered.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-slate-100/80 dark:bg-slate-700/60 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 backdrop-blur-sm border border-slate-200/40 dark:border-slate-600/40"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 font-medium disabled:opacity-50 shadow-lg hover:shadow-xl active:scale-95"
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

    // Render modal using portal to document.body to bypass any stacking context issues
    return createPortal(modalContent, document.body);
};

export default ConversationModal;
