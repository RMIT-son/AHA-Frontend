import React, { useState, useRef, useEffect } from "react";

const VoiceMessageDisplay = ({ message, isUser = false }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleError = (e) => {
            console.error("Audio error:", e);
            setIsPlaying(false);
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("error", handleError);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("error", handleError);
        };
    }, []);

    const togglePlayback = () => {
        const audio = audioRef.current;
        if (!audio || !message.audioUrl) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch((error) => {
                        console.error("Error playing audio:", error);
                        setIsPlaying(false);
                    });
            }
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getProgressPercentage = () => {
        if (duration === 0) return 0;
        return (currentTime / duration) * 100;
    };

    const handleProgressClick = (e) => {
        const audio = audioRef.current;
        if (!audio || duration === 0) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;

        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-lg max-w-xs ${
                isUser
                    ? "bg-orange-500 text-white ml-auto"
                    : "bg-gray-100 text-gray-900"
            }`}
        >
            {/* Audio element */}
            <audio ref={audioRef} src={message.audioUrl} preload="metadata" />

            {/* Play/Pause button */}
            <button
                onClick={togglePlayback}
                className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                    isUser
                        ? "bg-white/20 hover:bg-white/30 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                disabled={!message.audioUrl}
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                ) : (
                    <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                    </svg>
                )}
            </button>

            {/* Waveform/Progress visualization */}
            <div className="flex-1 min-w-0">
                <div
                    className={`h-2 rounded-full cursor-pointer ${
                        isUser ? "bg-white/30" : "bg-gray-300"
                    }`}
                    onClick={handleProgressClick}
                    title="Click to seek"
                >
                    <div
                        className={`h-full rounded-full transition-all duration-100 ${
                            isUser ? "bg-white" : "bg-orange-500"
                        }`}
                        style={{ width: `${getProgressPercentage()}%` }}
                    />
                </div>
                <div
                    className={`text-xs mt-1 flex justify-between ${
                        isUser ? "text-white/80" : "text-gray-600"
                    }`}
                >
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Voice icon */}
            <div className={`${isUser ? "text-white/80" : "text-gray-500"}`}>
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                </svg>
            </div>

            {/* Status indicators */}
            <div className="flex items-center">
                {message.status === "pending" && (
                    <div className="flex space-x-1">
                        <div
                            className={`w-1 h-1 rounded-full animate-pulse ${
                                isUser ? "bg-white/60" : "bg-gray-400"
                            }`}
                        ></div>
                        <div
                            className={`w-1 h-1 rounded-full animate-pulse ${
                                isUser ? "bg-white/60" : "bg-gray-400"
                            }`}
                            style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                            className={`w-1 h-1 rounded-full animate-pulse ${
                                isUser ? "bg-white/60" : "bg-gray-400"
                            }`}
                            style={{ animationDelay: "0.4s" }}
                        ></div>
                    </div>
                )}

                {message.status === "failed" && (
                    <div
                        className="text-red-500"
                        title={message.error || "Failed to send"}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                )}

                {message.status === "delivered" && isUser && (
                    <div className="text-white/60">
                        <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceMessageDisplay;
