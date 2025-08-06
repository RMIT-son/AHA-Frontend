import { memo } from 'react';
import AvatarInside from './AvatarInside';
import ImageDisplay from './ImageDisplay';
import FileDisplay from './FileDisplay';

const UserMessage = memo(({ 
    message, 
    user, 
    messageKey,
    getImageUrl,
    getImageAlt,
    onImageClick,
    onImageLoad,
    loadedImages
}) => {
    return (
        <div className="flex justify-start">
            <div>
                {/* Single image */}
                {message.image && (
                    <div className="mb-2 mt-10">
                        <ImageDisplay
                            imageUrl={message.image}
                            alt="User uploaded image"
                            scrollOnLoad={true}
                            messageId={messageKey}
                            onImageClick={onImageClick}
                            onImageLoad={onImageLoad}
                            loadedImages={loadedImages}
                        />
                    </div>
                )}

                {/* Multiple files */}
                <FileDisplay
                    files={message.files}
                    messageKey={messageKey}
                    getImageUrl={getImageUrl}
                    getImageAlt={getImageAlt}
                    onImageClick={onImageClick}
                    onImageLoad={onImageLoad}
                    loadedImages={loadedImages}
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