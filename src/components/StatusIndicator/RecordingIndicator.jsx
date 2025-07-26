export default function RecordingIndicator({ isRecording, recordingTime, formatTime }) {
    if (!isRecording) return null;

    return (
        <div className="absolute right-28 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-red-500 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Recording {formatTime(recordingTime)}</span>
        </div>
    );
}
