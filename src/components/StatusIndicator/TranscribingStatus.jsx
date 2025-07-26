export default function TranscribingStatus({ isTranscribing }) {
    if (!isTranscribing) return null;

    return (
        <div className="mb-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
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
                Transcribing your voice message...
            </span>
        </div>
    );
}
