import { memo } from 'react';
import AvatarInside from './AvatarInside';
import FileDisplay from './FileDisplay';
import FilePreview from './FilePreview';

const UserMessage = memo(({
    message,
    user,
    messageKey,
    onImageClick,
    onFileClick
}) => {
    return (
        <div className="flex justify-start">
            <div>
                {/* Single image */}
                {message.image && (
                    <div className="mb-2 mt-10">
                        <FilePreview
                            file={message.image}
                            index={0}
                            onImageClick={onImageClick}
                            onFileClick={onFileClick}
                            messageKey={`${messageKey}-image`}
                        />
                    </div>
                )}

                {/* Multiple files (images and other files) */}
                <FileDisplay
                    files={message.files}
                    messageKey={messageKey}
                    onImageClick={onImageClick}
                    onFileClick={onFileClick}
                />

                {/* User message bubble */}
                {message.content && message.content.trim() && (
                    <div className="inline-flex items-center bg-[#1a1a1a] text-white rounded-2xl px-3 py-3 max-w-full shadow-md">
                        <AvatarInside user={user} />
                        <span className="ml-2 break-words whitespace-pre-wrap text-sm">
                            {message.content}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
});

UserMessage.displayName = 'UserMessage';

export default UserMessage;