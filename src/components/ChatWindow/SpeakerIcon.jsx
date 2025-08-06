import { memo } from 'react';

const SpeakerIcon = memo(({ onClick, className = "" }) => (
    <button
        onClick={onClick}
        className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 opacity-60 hover:opacity-100 ${className}`}
        title="Read message aloud"
    >
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
    </button>
));

SpeakerIcon.displayName = 'SpeakerIcon';
export default SpeakerIcon;