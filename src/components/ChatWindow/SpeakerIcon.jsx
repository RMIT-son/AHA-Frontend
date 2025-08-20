import { memo, useCallback, useState, useRef, useEffect } from "react";
import { sendTextToVoiceSpeaker } from "../../controllers/chat";
import speakerManager from "./speakerManager"; // Import the speaker manager

const SpeakerIcon = memo(({ message }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // New loading state
    const utteranceRef = useRef(null);
    const audioRef = useRef(null);
    const abortControllerRef = useRef(null);
    const instanceRef = useRef({}); // Reference to this component instance

    // Function to stop speaking - can be called internally or from manager
    const stopSpeaking = useCallback(() => {
        // Stop Web Speech API
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        // Stop HTML5 Audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = "";
            audioRef.current = null;
        }

        // Abort any ongoing fetch requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        setIsPlaying(false);
        setIsLoading(false); // Reset loading state
        utteranceRef.current = null;
    }, []);

    // Function that can be called by the speaker manager
    const stopFromManager = useCallback(() => {
        stopSpeaking();
    }, [stopSpeaking]);

    // Attach the stop function to the instance reference
    useEffect(() => {
        instanceRef.current.stopFromManager = stopFromManager;
    }, [stopFromManager]);

    const startSpeaking = useCallback(async () => {
        s;
        // Register this speaker as the active one
        speakerManager.setActiveSpeaker(instanceRef.current);

        setIsLoading(true); // Start loading
        setIsPlaying(false);

        try {
            // Create abort controller for this request
            abortControllerRef.current = new AbortController();

            // Try your custom TTS function first
            const result = await sendTextToVoiceSpeaker(message.content);

            // If request was aborted, don't continue
            if (abortControllerRef.current?.signal.aborted) {
                return;
            }

            setIsLoading(false); // Stop loading
            setIsPlaying(true); // Start playing

            // If your function returns an audio URL or blob
            if (
                result &&
                (result.audioUrl || result.url || typeof result === "string")
            ) {
                const audioUrl = result.audioUrl || result.url || result;
                audioRef.current = new Audio(audioUrl);

                audioRef.current.onended = () => {
                    setIsPlaying(false);
                    speakerManager.clearActiveSpeaker(instanceRef.current);
                    audioRef.current = null;
                };

                audioRef.current.onerror = () => {
                    console.error("Audio playback error");
                    setIsPlaying(false);
                    speakerManager.clearActiveSpeaker(instanceRef.current);
                    audioRef.current = null;
                };

                await audioRef.current.play();
            } else {
                // If no audio returned, assume it handles playback internally
                setIsPlaying(false);
                speakerManager.clearActiveSpeaker(instanceRef.current);
            }
        } catch (error) {
            setIsLoading(false); // Stop loading on error

            if (error.name === "AbortError") {
                return;
            }

            console.error(
                "Custom TTS error, falling back to Web Speech API:",
                error
            );

            // Fallback to Web Speech API
            if ("speechSynthesis" in window) {
                setIsPlaying(true); // Start playing immediately for speech synthesis

                const utterance = new SpeechSynthesisUtterance(message.content);
                utteranceRef.current = utterance;

                utterance.onend = () => {
                    setIsPlaying(false);
                    speakerManager.clearActiveSpeaker(instanceRef.current);
                    utteranceRef.current = null;
                };

                utterance.onerror = () => {
                    setIsPlaying(false);
                    speakerManager.clearActiveSpeaker(instanceRef.current);
                    utteranceRef.current = null;
                    console.error("Speech synthesis error");
                };

                window.speechSynthesis.speak(utterance);
            } else {
                setIsPlaying(false);
                speakerManager.clearActiveSpeaker(instanceRef.current);
                console.error("Speech synthesis not supported");
            }
        }
    }, [message.content]);

    const handleSpeaker = useCallback(() => {
        if (isPlaying || isLoading) {
            stopSpeaking();
            speakerManager.clearActiveSpeaker(instanceRef.current);
        } else {
            startSpeaking();
        }
    }, [isPlaying, isLoading, stopSpeaking, startSpeaking]);

    // Register/unregister with speaker manager
    useEffect(() => {
        speakerManager.registerSpeaker(instanceRef.current);

        return () => {
            speakerManager.unregisterSpeaker(instanceRef.current);
            speakerManager.clearActiveSpeaker(instanceRef.current);
            stopSpeaking();
        };
    }, [stopSpeaking]);

    // Determine button state and styling
    const getButtonState = () => {
        if (isLoading) return "loading";
        if (isPlaying) return "playing";
        return "idle";
    };

    const buttonState = getButtonState();

    return (
        <button
            onClick={handleSpeaker}
            disabled={isLoading} // Disable button while loading
            className={`mt-1 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 opacity-60 hover:opacity-100 ${
                buttonState === "playing"
                    ? "bg-blue-50 text-blue-600"
                    : buttonState === "loading"
                    ? "bg-yellow-50 text-yellow-600 cursor-wait"
                    : ""
            }`}
            title={
                buttonState === "loading"
                    ? "Loading audio..."
                    : buttonState === "playing"
                    ? "Stop reading"
                    : "Read message aloud"
            }
        >
            {buttonState === "loading" ? (
                // Loading spinner icon
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-600 animate-spin"
                >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
            ) : buttonState === "playing" ? (
                // Stop/Pause icon
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600"
                >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            ) : (
                // Speaker icon
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500"
                >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
            )}
        </button>
    );
});

SpeakerIcon.displayName = "SpeakerIcon";

export default SpeakerIcon;
