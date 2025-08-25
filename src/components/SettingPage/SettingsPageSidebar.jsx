import { Link } from "react-router-dom";

const SettingsPageSidebar = ({ activeSection }) => {
    const sections = [
        { key: "profile", label: "Profile" },
        { key: "appearance", label: "Appearance" },
        { key: "account", label: "Account" },
    ];

    return (
        <div className="w-48 min-w-48">
            <nav className="space-y-1">
                {sections.map((section) => {
                    const isActive = activeSection === section.key;
                    return (
                        <Link
                            key={section.key}
                            to={`/settings/${section.key}`}
                            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                                isActive
                                    ? // active
                                      "bg-gray-200 text-gray-900 dark:bg-neutral-800 dark:text-gray-100"
                                    : // inactive
                                      "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-800 dark:hover:text-gray-100"
                            }`}
                        >
                            {section.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default SettingsPageSidebar;
