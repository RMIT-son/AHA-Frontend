import { memo } from "react";
import AvatarInside from "./AvatarInside";
import FileDisplay from "./FileDisplay";
import FilePreview from "./FilePreview";

const UserMessage = memo(
    ({ message, user, messageKey, onImageClick, onFileClick }) => {
        return (
            <div className="flex justify-end mb-6">
                <div className="max-w-[85%]">
                    {/* Files above message */}
                    {message.image && (
                        <div className="mb-2">
                            <FilePreview
                                file={message.image}
                                index={0}
                                onImageClick={onImageClick}
                                onFileClick={onFileClick}
                                messageKey={`${messageKey}-image`}
                            />
                        </div>
                    )}

                    <FileDisplay
                        files={message.files}
                        messageKey={messageKey}
                        onImageClick={onImageClick}
                        onFileClick={onFileClick}
                    />

                    {/* User message bubble */}
                    {message.content && message.content.trim() && (
                        <div className="flex items-start gap-3 justify-end">
                            {/* Message Content */}
                            <div className="flex-1 min-w-0 flex justify-end">
                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm max-w-full">
                                    <span className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                                        {message.content}
                                    </span>
                                </div>
                            </div>

                            {/* User Avatar */}
                            <div className="flex-shrink-0 mt-1">
                                <AvatarInside user={user} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

UserMessage.displayName = "UserMessage";

export default UserMessage;
