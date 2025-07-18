import { useEffect } from "react";
import { X, Download } from "lucide-react";

const ImagePreviewModal = ({ imageUrl, alt, isOpen, onClose }) => {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                onClose();
            }
        };

        // Use capture phase to handle the event before it bubbles
        document.addEventListener("keydown", handleEscape, true);
        return () =>
            document.removeEventListener("keydown", handleEscape, true);
    }, [isOpen, onClose]);

    // Lock scroll on open and prevent focus issues
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            // Prevent any scrolling behaviors while modal is open
            const preventScroll = (e) => {
                if (e.target.closest(".fixed.inset-0")) {
                    return; // Allow events within modal
                }
                // Prevent keyboard navigation that might cause scrolling
                if (
                    [
                        "ArrowUp",
                        "ArrowDown",
                        "PageUp",
                        "PageDown",
                        "Home",
                        "End",
                        "Space",
                    ].includes(e.key)
                ) {
                    e.preventDefault();
                }
            };

            document.addEventListener("keydown", preventScroll, true);

            return () => {
                document.body.style.overflow = "unset";
                document.removeEventListener("keydown", preventScroll, true);
            };
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleModalClick = (e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleContentClick = (e) => {
        // Only prevent propagation for the image, not for buttons
        if (e.target.tagName === "IMG") {
            e.stopPropagation();
        }
    };

    const handleCloseClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-300 ease-out"
            onClick={handleModalClick}
            onKeyDown={(e) => e.stopPropagation()}
        >
            {/* Modal Content */}
            <div
                onClick={handleContentClick}
                className="relative w-[90vw] max-w-4xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 ease-out scale-100"
            >
                {/* Controls */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                        onClick={handleCloseClick}
                        type="button"
                        title="Close"
                        className="cursor-pointer p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Image Preview */}
                <img
                    src={imageUrl}
                    alt={alt}
                    className="w-full h-auto max-h-[90vh] object-contain bg-black/90 backdrop-blur-sm"
                    onLoad={(e) => e.stopPropagation()}
                />
            </div>

            {/* Footer tip */}
            <div className="absolute bottom-6 text-white text-sm bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                Click outside or press <strong>Esc</strong> to close
            </div>
        </div>
    );
};

export default ImagePreviewModal;
