import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
    ChatPage,
    LoginPage,
    RegisterPage,
    SettingsPage,
    ForgotPasswordPage,
    ResetPasswordPage,
} from "./pages";
import { LoggedInRoutes, NotLoggedInRoutes } from "./routes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<NotLoggedInRoutes />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPasswordPage />}
                    />
                    <Route
                        path="/reset-password"
                        element={<ResetPasswordPage />}
                    />
                </Route>

                <Route element={<LoggedInRoutes />}>
                    {/* Main pages */}
                    <Route path="/" element={<ChatPage />} />
                    <Route path="/chat/:id" element={<ChatPage />} />

                    {/* Settings with nested routes */}
                    <Route path="/settings" element={<SettingsPage />}>
                        {/* Default redirect to /settings/profile */}
                        <Route
                            index
                            element={<Navigate to="profile" replace />}
                        />

                        {/* Nested paths for different settings sections */}
                        <Route
                            path="profile"
                            element={<SettingsPage section="profile" />}
                        />
                        <Route
                            path="appearance"
                            element={<SettingsPage section="appearance" />}
                        />
                        <Route
                            path="account"
                            element={<SettingsPage section="account" />}
                        />
                    </Route>
                </Route>

                {/* Catch all unknown routes and redirect to login if not logged in */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
