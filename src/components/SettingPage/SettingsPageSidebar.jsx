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
                                    ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-400 shadow-sm"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-700/50 dark:hover:text-gray-100 border-l-4 border-transparent hover:border-emerald-200 dark:hover:border-emerald-600"
                            }`}
                        >
                            <div className="flex items-center">
                                <span>{section.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
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
