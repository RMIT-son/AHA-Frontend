import { memo } from 'react';

const TypingIndicator = memo(() => (
    <div className="max-w-[90%] pl-2">
        <div className="flex space-x-1 mt-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
            <div
                className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
            ></div>
            <div
                className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
            ></div>
        </div>
    </div>
));

TypingIndicator.displayName = 'TypingIndicator';
export default TypingIndicator;
