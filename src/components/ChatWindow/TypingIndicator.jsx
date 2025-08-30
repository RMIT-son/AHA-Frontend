import { memo } from "react";

const TypingIndicator = memo(() => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            border: "none",
            outline: "none",
            background: "transparent",
            padding: 0,
            margin: 0,
        }}
    >
        {/* Three sequential beating hearts with smoother transitions */}
        <div
            className="w-6 h-6 text-emerald-500"
            style={{
                animation: "smoothHeartbeat 2.4s ease-in-out infinite",
                animationDelay: "0s",
            }}
        >
            <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        </div>

        <div
            className="w-6 h-6 text-emerald-400"
            style={{
                animation: "smoothHeartbeat 2.4s ease-in-out infinite",
                animationDelay: "0.8s",
            }}
        >
            <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        </div>

        <div
            className="w-6 h-6 text-emerald-300"
            style={{
                animation: "smoothHeartbeat 2.4s ease-in-out infinite",
                animationDelay: "1.6s",
            }}
        >
            <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        </div>

        {/* Custom smooth heartbeat animation */}
        <style jsx>{`
            @keyframes smoothHeartbeat {
                0%,
                70%,
                100% {
                    transform: scale(1);
                    opacity: 0.5;
                    filter: brightness(0.8);
                }
                8% {
                    transform: scale(1.1);
                    opacity: 0.8;
                    filter: brightness(0.9);
                }
                16% {
                    transform: scale(1.15);
                    opacity: 1;
                    filter: brightness(1.1);
                }
                24% {
                    transform: scale(1.05);
                    opacity: 0.9;
                    filter: brightness(1);
                }
                32% {
                    transform: scale(1.2);
                    opacity: 1;
                    filter: brightness(1.2);
                }
                40% {
                    transform: scale(1);
                    opacity: 0.7;
                    filter: brightness(0.9);
                }
            }
        `}</style>
    </div>
));

TypingIndicator.displayName = "TypingIndicator";

export default TypingIndicator;
