import { useEffect } from "react";
import { X, Download } from "lucide-react";

const ImagePreviewModal = ({ imageUrl, alt, isOpen, onClose }) => {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Lock scroll on open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-300 ease-out"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-[90vw] max-w-4xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 ease-out scale-100"
            >
                {/* Controls */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                        onClick={onClose}
                        title="Close"
                        className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Image Preview */}
                <img
                    src={imageUrl}
                    alt={alt}
                    className="w-full h-auto max-h-[90vh] object-contain bg-black/90 backdrop-blur-sm"
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
