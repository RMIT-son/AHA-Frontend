import { memo } from "react";

const EmptyState = memo(() => (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
        <div className="text-center max-w-2xl">
            {/* Logo/Icon */}
            <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 rounded-full flex items-center justify-center">
                    <img
                        src="/logo.png"
                        alt="HealthCare AI Logo"
                        className="w-10 h-10 object-cover filter contrast-50"
                    />
                </div>
            </div>

            {/* Main Greeting */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white mb-3">
                Hello! How can I assist you today?
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8">
                I'm your healthcare AI assistant, ready to help with medical
                questions, health guidance, and wellness support.
            </p>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center mb-3 mx-auto">
                        <svg
                            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white text-sm mb-1">
                        Ask Questions
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Get answers about symptoms, medications, or health
                        concerns
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center mb-3 mx-auto">
                        <svg
                            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white text-sm mb-1">
                        Wellness Tips
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Learn about healthy habits and preventive care
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center mb-3 mx-auto">
                        <svg
                            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white text-sm mb-1">
                        Health Records
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Discuss your medical history and test results
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center mb-3 mx-auto">
                        <svg
                            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white text-sm mb-1">
                        Emergency Help
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Get immediate guidance for urgent health situations
                    </p>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    <strong>Medical Disclaimer:</strong> This AI assistant
                    provides general health information and should not replace
                    professional medical advice. Always consult healthcare
                    providers for medical decisions.
                </p>
            </div>
        </div>
    </div>
));

EmptyState.displayName = "EmptyState";

export default EmptyState;
