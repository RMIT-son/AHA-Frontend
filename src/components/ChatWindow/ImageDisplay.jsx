import { memo } from 'react';
import FilePreview from '../FilePreview';

const FileDisplay = memo(({ 
    files, 
    messageKey, 
    onImageClick,
    onFileClick
}) => {
    if (!files || files.length === 0) {
        return null;
    }

    return (
        <div className="mb-2 space-y-2">
            {files.map((file, fileIndex) => (
                <FilePreview
                    key={`${messageKey}-file-${fileIndex}`}
                    file={file}
                    index={fileIndex}
                    onImageClick={onImageClick}
                    onFileClick={onFileClick}
                    messageKey={`${messageKey}-${fileIndex}`}
                />
            ))}
        </div>
    );
});

FileDisplay.displayName = 'FileDisplay';

export default FileDisplay;