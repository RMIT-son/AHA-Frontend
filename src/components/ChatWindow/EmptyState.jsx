import { memo } from "react";

const EmptyState = memo(() => (
    <div className="flex flex-col items-center justify-center h-full px-4 py-4 sm:py-8">
        <div className="text-center max-w-2xl w-full">
            {/* Logo/Icon - Smaller on mobile */}
            <div className="mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 rounded-full flex items-center justify-center">
                    <img
                        src="/logo.png"
                        alt="HealthCare AI Logo"
                        className="w-7 h-7 sm:w-10 sm:h-10 object-cover filter contrast-50"
                    />
                </div>
            </div>

            {/* Main Greeting - Smaller text on mobile */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-3">
                Hello! How can I assist you today?
            </h1>

            {/* Subtitle - Shorter and smaller on mobile */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-8 px-2">
                Your healthcare AI assistant for medical questions and wellness
                support.
            </p>

            {/* Suggestion Cards - 2x2 grid on mobile, more compact */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-xl mx-auto mb-4 sm:mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-shadow">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                        <svg
                            className="w-3 h-3 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400"
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
                    <h3 className="font-medium text-gray-800 dark:text-white text-xs sm:text-sm mb-1">
                        Ask Questions
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                        Get answers about symptoms, medications, or health
                        concerns
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-shadow">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                        <svg
                            className="w-3 h-3 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400"
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
                    <h3 className="font-medium text-gray-800 dark:text-white text-xs sm:text-sm mb-1">
                        Wellness Tips
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                        Learn about healthy habits and preventive care
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-shadow">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                        <svg
                            className="w-3 h-3 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400"
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
                    <h3 className="font-medium text-gray-800 dark:text-white text-xs sm:text-sm mb-1">
                        Health Records
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                        Discuss your medical history and test results
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-shadow">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                        <svg
                            className="w-3 h-3 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400"
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
                    <h3 className="font-medium text-gray-800 dark:text-white text-xs sm:text-sm mb-1">
                        Emergency Help
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                        Get immediate guidance for urgent health situations
                    </p>
                </div>
            </div>

            {/* Disclaimer - Smaller and more compact on mobile */}
            <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    <strong>Medical Disclaimer:</strong> This AI provides
                    general health information and should not replace
                    professional medical advice. Always consult healthcare
                    providers for medical decisions.
                </p>
            </div>
        </div>
    </div>
));

EmptyState.displayName = "EmptyState";

export default EmptyState;
