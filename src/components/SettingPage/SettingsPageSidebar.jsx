import { Link } from "react-router-dom";

const SettingsPageSidebar = ({ activeSection, onSectionChange, user }) => {
    const sections = [
        { key: "profile", label: "Profile" },
        { key: "appearance", label: "Appearance" },
        { key: "account", label: "Account" },
    ];

    return (
        <div className="w-full">
            <nav className="space-y-1 p-2">
                {sections.map((section) => {
                    const isActive = activeSection === section.key;
                    return (
                        <Link
                            key={section.key}
                            to={`/settings/${section.key}`}
                            onClick={() =>
                                onSectionChange && onSectionChange(section.key)
                            }
                            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? // Active state - better contrast and visual feedback
                                      "bg-blue-50 text-blue-700 border-l-4 border-blue-500 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400 shadow-sm"
                                    : // Inactive state - improved hover effects
                                      "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-700/50 dark:hover:text-gray-100 border-l-4 border-transparent hover:border-gray-200 dark:hover:border-neutral-600"
                            }`}
                        >
                            <div className="flex items-center">
                                <span>{section.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default SettingsPageSidebar;
