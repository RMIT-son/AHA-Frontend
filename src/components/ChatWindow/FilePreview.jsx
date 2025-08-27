import { memo, useState, useCallback } from 'react';

const FilePreview = memo(({ 
    file, 
    index, 
    onImageClick, 
    onFileClick,
    messageKey 
}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Helper function to get file info
    const getFileInfo = useCallback(() => {
        if (typeof file === 'string') {
            // If file is just a URL string
            const url = file;
            const fileName = url.split('/').pop() || 'Unknown file';
            const extension = fileName.split('.').pop()?.toLowerCase() || '';
            return { url, fileName, extension, size: null };
        }

        return {
            url: file?.url || file?.file || file?.src || file?.path || '',
            fileName: file?.name || file?.fileName || `File ${index + 1}`,
            extension: file?.type?.split('/').pop() || file?.name?.split('.').pop()?.toLowerCase() || '',
            size: file?.size || null,
            type: file?.type || ''
        };
    }, [file, index]);

    const fileInfo = getFileInfo();

    // Check if file is an image
    const isImage = useCallback(() => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        return imageExtensions.includes(fileInfo.extension) || 
               fileInfo.type?.startsWith('image/');
    }, [fileInfo]);

    // Check if file is audio
    const isAudio = useCallback(() => {
        const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
        return audioExtensions.includes(fileInfo.extension) || 
               fileInfo.type?.startsWith('audio/');
    }, [fileInfo]);

    // Format file size
    const formatFileSize = useCallback((bytes) => {
        if (!bytes) return '';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }, []);

    // Get file icon based on extension
    const getFileIcon = useCallback(() => {
        const { extension } = fileInfo;
        
        if (isImage()) {
            return (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
    }

    // Render audio preview
    if (isAudio()) {
        return (
            <div className="mt-2 max-w-md">
                <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0 text-purple-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {fileInfo.fileName}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span className="uppercase font-medium">{fileInfo.extension}</span>
                                {fileInfo.size && (
                                    <>
                                        <span>•</span>
                                        <span>{formatFileSize(fileInfo.size)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Audio player */}
                    <audio 
                        controls 
                        className="w-full h-8" 
                        preload="metadata"
                        style={{ filter: 'sepia(20%) saturate(70%) hue-rotate(315deg)' }}
                    >
                        <source src={fileInfo.url} type={fileInfo.type || `audio/${fileInfo.extension}`} />
                        Your browser does not support the audio element.
                    </audio>
                    
                    {/* Download button */}
                    <button
                        onClick={handleClick}
                        className="mt-2 flex items-center justify-center w-full px-3 py-1.5 text-xs font-medium text-purple-600 bg-white border border-purple-200 rounded-md hover:bg-purple-50 transition-colors duration-200"
                    >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                    </button>
                </div>
            </div>
    )}

        if (['pdf'].includes(extension)) {
            return (
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
            );
        }

        if (['doc', 'docx'].includes(extension)) {
            return (
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
            );
        }

        if (['xls', 'xlsx'].includes(extension)) {
            return (
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
            );
        }

        if (['txt', 'json', 'csv', 'md'].includes(extension)) {
            return (
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        }

        if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(extension)) {
            return (
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
            );
        }

        // Default file icon
        return (
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    }, [fileInfo, isImage]);

    const handleClick = useCallback(() => {
        if (isImage()) {
            onImageClick(fileInfo.url, fileInfo.fileName);
        } else if (isAudio()) {
            // For audio files, we'll handle them specially
            onFileClick?.(fileInfo);
        } else {
            onFileClick?.(fileInfo);
        }
    }, [isImage, isAudio, fileInfo, onImageClick, onFileClick]);

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
        setImageError(false);
    }, []);

    const handleImageError = useCallback(() => {
        setImageError(true);
        setImageLoaded(false);
    }, []);

    if (!fileInfo.url) {
        return null;
    }

    // Render image preview
    if (isImage() && !imageError) {
        return (
            <div className="mt-2 max-w-md">
                {!imageLoaded && (
                    <div className="animate-pulse bg-gray-200 rounded-lg h-48 max-w-sm flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <img
                    src={fileInfo.url}
                    alt={fileInfo.fileName}
                    className={`rounded-lg max-w-full h-auto shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                        imageLoaded ? "opacity-100" : "opacity-0 absolute"
                    }`}
                    style={{ maxHeight: "400px" }}
                    onClick={handleClick}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    loading="lazy"
                />
                
                {/* Image info overlay */}
                {imageLoaded && (
                    <div className="mt-1 text-xs text-gray-500">
                        {fileInfo.fileName}
                        {fileInfo.size && ` • ${formatFileSize(fileInfo.size)}`}
                    </div>
                )}
            </div>
        );
    }

    // Render file preview for non-images or failed image loads
    return (
        <div 
            className="mt-2 max-w-md p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
            onClick={handleClick}
        >
            <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                    {getFileIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {fileInfo.fileName}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="uppercase font-medium">{fileInfo.extension}</span>
                        {fileInfo.size && (
                            <>
                                <span>•</span>
                                <span>{formatFileSize(fileInfo.size)}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>
        </div>
    );
});

FilePreview.displayName = 'FilePreview';

export default FilePreview;