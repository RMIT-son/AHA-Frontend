import { useLocation } from "react-router-dom";
import {
    Account,
    Profile,
    Appearance,
    SettingsPageSidebar,
    ChatLayout
} from "../components";

const SettingsPage = ({ section }) => {
    const location = useLocation();
    const currentSection = section || location.pathname.split("/").pop();

    const views = {
        profile: <Profile />,
        appearance: <Appearance />,
        account: <Account />,
    };

    return (
        <ChatLayout headerTitle="Settings">
            <div className="flex-1 overflow-hidden">
                <div className="h-full py-8 px-8">
                    <div className="w-full max-w-7xl mx-auto h-full">
                        {/* Main Settings heading */}
                        <h1 className="text-3xl font-semibold mb-8 text-gray-900">
                            Settings
                        </h1>

                        {/* Sidebar and Main content container */}
                        <div className="flex gap-2 h-full">
                            {/* Settings Sidebar */}
                            <SettingsPageSidebar
                                activeSection={currentSection}
                            />

                            {/* Main content */}
                            <div className="flex-1 ml-4">
                                {views[currentSection] || <Profile />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ChatLayout>
    );
};

export default SettingsPage;
