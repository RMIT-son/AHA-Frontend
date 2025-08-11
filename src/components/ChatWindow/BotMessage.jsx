import { memo } from 'react';
import MarkdownTranslator from "../ChatWindow/MarkdownTranslator";
import SpeakerIcon from './SpeakerIcon';

const BotMessage = memo(({
    message,
    shouldStream,
    onSpeakerClick,
    messageIndex
}) => {
    return (
        <div className="group relative mb-10">
            <div className="flex justify-start">
                <div className="max-w-[90%] pl-2 relative">
                    <div className="relative">
                        <div className="relative text-gray-800">
                            <MarkdownTranslator
                                content={message.content}
                                className="text-sm leading-relaxed"
                                isStreaming={shouldStream}
                            />
                        </div>
                    </div>

                    {/* Speaker icon for bot messages only */}
                    {message.content &&
                        message.content.trim() &&
                        !shouldStream && (
                            <div className="absolute mb-5 -left-1 -right-10 group-hover:opacity-100 transition-opacity duration-200">
                                <SpeakerIcon
                                    onClick={() =>{ 
                                        onSpeakerClick(message, messageIndex)
                                    }}
                                />
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
});

BotMessage.displayName = 'BotMessage';

export default BotMessage;
