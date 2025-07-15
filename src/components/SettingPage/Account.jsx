import React from "react";

const Account = () => {
    return (
        <div className="max-w-4xl">
            <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-900 font-medium">
                            Log out of all devices
                        </p>
                    </div>
                    <button className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        Log out
                    </button>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-900 font-medium">
                            Log out
                        </p>
                    </div>
                    <button className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                        Delete account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Account;
