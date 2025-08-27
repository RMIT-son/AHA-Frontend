import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "../src/contexts/ThemeContext";
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
            <ThemeProvider>
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

                        {/* Settings routes - simplified structure */}
                        <Route
                            path="/settings"
                            element={
                                <Navigate to="/settings/profile" replace />
                            }
                        />
                        <Route
                            path="/settings/profile"
                            element={<SettingsPage section="profile" />}
                        />
                        <Route
                            path="/settings/appearance"
                            element={<SettingsPage section="appearance" />}
                        />
                        <Route
                            path="/settings/account"
                            element={<SettingsPage section="account" />}
                        />
                    </Route>

                    {/* Catch all unknown routes and redirect to login if not logged in */}
                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />
                </Routes>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
