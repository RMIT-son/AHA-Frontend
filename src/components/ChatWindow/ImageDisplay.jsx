import { useState, useRef, useCallback, useEffect, memo } from 'react';

const ImageDisplay = memo(({
    imageUrl,
    alt = "User uploaded image",
    scrollOnLoad = true,
    messageId,
    onImageClick,
    scrollToBottomSmooth,
    isModalOpen,
    isClosingModal,
    scrollingEnabled,
    loadedImages
}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageRef = useRef(null);

    const handleImageClick = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            onImageClick(imageUrl, alt);
        },
        [imageUrl, alt, onImageClick]
    );

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);

        // Create a unique key for this image
        const imageKey = `${messageId}-${imageUrl}`;

        // Only scroll if this specific image hasn't been loaded before
        if (
            scrollOnLoad &&
            !isModalOpen &&
            !isClosingModal.current &&
            !loadedImages.current.has(imageKey) &&
            scrollingEnabled.current
        ) {
            loadedImages.current.add(imageKey);
            // Delay scroll to ensure image is rendered
            setTimeout(() => {
                if (
                    scrollingEnabled.current &&
                    !isModalOpen &&
                    !isClosingModal.current
                ) {
                    scrollToBottomSmooth();
                }
            }, 50);
        }
    }, [scrollOnLoad, imageUrl, messageId, isModalOpen, isClosingModal, scrollingEnabled, loadedImages, scrollToBottomSmooth]);

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    // Preload image to reduce loading time
    useEffect(() => {
        if (imageUrl && !imageError) {
            const img = new Image();
            img.onload = () => {
                setImageLoaded(true);
            };
            img.onerror = () => {
                setImageError(true);
            };
            img.src = imageUrl;
        }
    }, [imageUrl, imageError]);

    if (imageError) {
        return (
            <div className="mt-2 max-w-md p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center gap-2 text-red-600">
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span className="text-sm">
                        Failed to load image
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-2 max-w-md">
            {!imageLoaded && (
                <div
                    className="animate-pulse bg-gray-200 rounded-lg"
                    style={{ height: "200px", maxWidth: "400px" }}
                >
                    <div className="flex items-center justify-center h-full">
                        <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                </div>
            )}
            <img
                ref={imageRef}
                src={imageUrl}
                alt={alt}
                className={`rounded-lg max-w-full h-auto shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                    imageLoaded ? "opacity-100" : "opacity-0 absolute"
                }`}
                style={{ maxHeight: "400px" }}
                onClick={handleImageClick}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
            />
        </div>
    );
});

ImageDisplay.displayName = 'ImageDisplay';

export default ImageDisplay;