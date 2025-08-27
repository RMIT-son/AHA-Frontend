export default function DragOverlay({ isDragOver }) {
    if (!isDragOver) return null;

    return (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/98 via-orange-50/95 to-amber-50/98 backdrop-blur-sm border-2 border-dashed border-orange-400 rounded-3xl flex items-center justify-center z-50">
            <div className="text-center p-6">
                <div className="relative mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg transform transition-transform duration-300 hover:scale-110">
                        <svg
                            className="w-8 h-8 text-white animate-bounce"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-orange-300 mx-auto animate-ping opacity-75"></div>
                </div>
                <p className="text-xl font-bold text-gray-800 mb-2">
                    Drop files here to upload
                </p>
                <p className="text-gray-600 mb-3">
                    Images, PDFs, and text files supported
                </p>
                <p className="text-sm text-gray-500">
                    You can also paste images with Ctrl+V
                </p>
            </div>
        </div>
    );
}
