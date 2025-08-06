import { memo } from 'react';
import MarkdownTranslator from './MarkdownTranslator';
import SpeakerIcon from './SpeakerIcon';

const BotMessage = memo(({ 
    message, 
    index, 
    shouldStream, 
    handleSpeaker 
}) => {
    return (
        <div className="group relative mb-6">
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
                            <div className="absolute mb-5 -left-1 -right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <SpeakerIcon
                                    onClick={() => handleSpeaker(message, index)}
                                />
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
});


export default BotMessage;