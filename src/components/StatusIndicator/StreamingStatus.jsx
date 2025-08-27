export default function StreamingStatus({ isStreaming, onCancelStream }) {
    if (!isStreaming) return null;

    return (
        <div className="mb-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                    ></div>
                </div>
                <span className="text-sm text-blue-700 font-medium">
                    AI is responding...
                </span>
            </div>
            <button
                onClick={onCancelStream}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full transition-colors duration-200 flex items-center gap-1"
            >
                <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
                Stop (Esc)
            </button>
        </div>
    );
}
