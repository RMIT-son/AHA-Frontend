import { memo } from 'react';
import ImageDisplay from './ImageDisplay';

const FileDisplay = memo(({ 
    files, 
    messageKey, 
    getImageUrl, 
    getImageAlt, 
    onImageClick, 
    onImageLoad, 
    loadedImages 
}) => {
    if (!files || files.length === 0) return null;

    return (
        <div className="mb-2 space-y-2">
            {files.map((file, fileIndex) => {
                const imageUrl = getImageUrl(file);
                const imageAlt = getImageAlt(file, fileIndex);

                if (!imageUrl) return null;

                return (
                    <ImageDisplay
                        key={`${messageKey}-file-${fileIndex}`}
                        imageUrl={imageUrl}
                        alt={imageAlt}
                        scrollOnLoad={true}
                        messageId={`${messageKey}-${fileIndex}`}
                        onImageClick={onImageClick}
                        onImageLoad={onImageLoad}
                        loadedImages={loadedImages}
                    />
                );
            })}
        </div>
    );
});

FileDisplay.displayName = 'FileDisplay';
export default FileDisplay;
