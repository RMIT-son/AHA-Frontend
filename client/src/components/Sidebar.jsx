import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, chatRooms = [], onSelectRoom, activeRoomId }) => {
    const navigate = useNavigate();

    return (
        <div
            className={`transition-all duration-300 ease-in-out ${
                isOpen ? "w-72" : "w-0"
            } bg-[#0E0E10] text-white p-6 flex flex-col items-end text-right relative overflow-hidden`}
        >
            <div
                className={`absolute inset-0 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none ${
                    !isOpen && "hidden"
                }`}
            />

            <nav
                className={`flex-grow z-10 space-y-4 text-base font-light w-full items-end text-right flex flex-col ${
                    !isOpen && "hidden"
                }`}
            >
                {/* New Chat */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 justify-end w-full py-2 px-3 hover:bg-gray-700 rounded-md"
                >
                    <span>New Chat</span>
                    <span className="w-5 h-5 bg-gray-600 rounded-sm flex items-center justify-center text-xs">
                        +
                    </span>
                </button>

                {/* Recent Chats section (always visible if chatRooms exist) */}
                {chatRooms.length > 0 && (
                    <div className="w-full mt-4 border-t border-gray-600 pt-4">
                        <h3 className="text-sm text-gray-400 mb-2 uppercase">
                            Recent Chats
                        </h3>
                        {chatRooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() =>
                                    onSelectRoom && onSelectRoom(room.id)
                                }
                                className={`w-full text-right py-1.5 px-3 text-sm rounded-md truncate ${
                                    activeRoomId === room.id
                                        ? "bg-blue-500 text-white"
                                        : "hover:bg-gray-700"
                                }`}
                            >
                                {room.name || `Chat ${room.id.slice(-5)}`}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* User section */}
            <div className={`mt-auto z-10 w-full ${!isOpen && "hidden"}`}>
                <div className="bg-gray-700 hover:bg-gray-600 cursor-pointer text-white rounded-xl p-3 flex flex-col text-sm w-full">
                    <span className="text-gray-300">Welcome back,</span>
                    <span className="font-semibold">Username</span>
                    <div className="text-right text-gray-400 mt-1 text-xs flex items-center justify-end">
                        Account Settings ⌄
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
