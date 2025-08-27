// components/ErrorAlert.js
import React from 'react';

const ErrorAlert = ({ error, onDismiss, type = "error" }) => {
    if (!error) return null;

    const getAlertStyles = () => {
        switch (type) {
            case 'success':
                return {
                    container: "bg-green-100 border border-green-400 text-green-700",
                    icon: "text-green-500",
                    dismissBtn: "text-green-400 hover:text-green-600"
                };
            case 'warning':
                return {
                    container: "bg-yellow-100 border border-yellow-400 text-yellow-700",
                    icon: "text-yellow-500",
                    dismissBtn: "text-yellow-400 hover:text-yellow-600"
                };
            case 'info':
                return {
                    container: "bg-blue-100 border border-blue-400 text-blue-700",
                    icon: "text-blue-500",
                    dismissBtn: "text-blue-400 hover:text-blue-600"
                };
            default: // error
                return {
                    container: "bg-red-100 border border-red-400 text-red-700",
                    icon: "text-red-500",
                    dismissBtn: "text-red-400 hover:text-red-600"
                };
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                    />
                );
            case 'warning':
                return (
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                );
            case 'info':
                return (
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                    />
                );
            default: // error
                return (
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                );
        }
    };

    const styles = getAlertStyles();

    return (
        <div className={`mb-4 p-4 rounded-md ${styles.container}`}>
            <div className="flex items-center">
                <svg
                    className={`w-4 h-4 mr-2 ${styles.icon}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    {getIcon()}
                </svg>
                <span className="text-sm font-medium flex-1">{error}</span>
                {onDismiss && (
                    <button
                        type="button"
                        className={`ml-auto ${styles.dismissBtn}`}
                        onClick={onDismiss}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorAlert;