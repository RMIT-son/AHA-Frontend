import { memo } from "react";
import MarkdownTranslator from "../ChatWindow/MarkdownTranslator";
import SpeakerIcon from "./SpeakerIcon";

const BotMessage = memo(({ message, shouldStream }) => {
    return (
        <div className="group relative mb-4 mt-5">
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

                    {/* Speaker icon for bot messages - positioned below the message */}
                    {message.content && message.content.trim() && (
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <SpeakerIcon message={message} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

BotMessage.displayName = "BotMessage";

export default BotMessage;
