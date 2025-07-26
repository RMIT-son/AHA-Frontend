import { useState, useRef } from "react";

export default function VoiceRecorder({
    onVoiceRecord,
    isTranscribing = false,
    isDisabled = false,
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingIntervalRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const audioChunks = [];
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

                if (onVoiceRecord && audioBlob.size > 0) {
                    onVoiceRecord(audioBlob);
                } else {
                    console.warn(
                        "No voice handler provided or empty recording"
                    );
                }

                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);

            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    return {
        isRecording,
        recordingTime,
        startRecording,
        stopRecording,
        formatTime,
        VoiceButton: () => (
            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-lg transition-all duration-200 ${
                    isRecording
                        ? "bg-red-500 text-white animate-pulse"
                        : isTranscribing
                        ? "bg-blue-500 text-white animate-pulse"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
                title={
                    isRecording
                        ? "Stop recording"
                        : isTranscribing
                        ? "Transcribing..."
                        : "Start voice recording"
                }
                disabled={isDisabled || isTranscribing}
            >
                {isRecording ? (
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M6 6h12v12H6z" />
                    </svg>
                ) : isTranscribing ? (
                    <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                ) : (
                    <svg
                        className="w-5 h-5"
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
                )}
            </button>
        ),
    };
}
