import { useState } from "react";

export default function ChatInput({ onSend, isLoading }) {
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;
        onSend(message);
        setMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="px-4 py-3 border-t bg-white flex items-center" // Giữ lại class gốc của form
        >
            {/* Tổng khung input: chứa input + icon + nút gửi */}
            {/* Giữ lại cấu trúc và class gốc của div này */}
            <div className="flex items-center flex-1 border border-gray-400 rounded-full px-4 py-2 bg-[#F9F9FB]">
                {/* Input text area */}
                <textarea
                    rows="1" // Có thể giữ hoặc điều chỉnh rows nếu bạn muốn
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    // Giữ lại class gốc và loại bỏ inline style overflowY
                    className="flex-1 bg-transparent outline-none text-sm pr-3 resize-none max-h-28" // Thêm max-h-28 và resize-none nếu bạn muốn giới hạn chiều cao và cấm resize
                    disabled={isLoading}
                    // Không thêm style={{overflowY: 'auto'}} ở đây
                />

                {/* Nhóm 3 icon trong nền xám bo tròn - giữ nguyên */}
                <div className="flex items-center space-x-2 bg-gray-200 rounded-full px-3 py-1 mr-2">
                    <button type="button" title="Mic" className="text-lg">
                        🎤
                    </button>
                    <button type="button" title="Image" className="text-lg">
                        🖼️
                    </button>
                    <button type="button" title="File" className="text-lg">
                        📄
                    </button>
                </div>

                {/* Emoji icon - giữ nguyên */}
                <button type="button" className="text-xl mr-2" title="Emoji">
                    🙂
                </button>

                {/* Nút gửi nằm trong khung input - giữ nguyên cấu trúc, chỉ cập nhật logic loading */}
                <button
                    type="submit"
                    className={`bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center ${
                        // Giữ class gốc, thêm logic cho isLoading
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title="Send"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    ) : (
                        "➤"
                    )}
                </button>
            </div>
        </form>
    );
}
