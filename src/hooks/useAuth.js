import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";

/**
 * Custom hook for handling user authentication and session management
 * Now integrated with Redux for better state consistency
 */
export default function useAuth(navigate, setUserId, setUser) {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);

    useEffect(() => {
        // If Redux already has user data, use that
        if (user) {
            setUserId(user.id);
            setUser(user);
            return;
        }

        // Otherwise, check cookies and sync with Redux
        const userCookie = Cookies.get("user");

        if (!userCookie) {
            // No session found - user is not authenticated
            navigate("/login");
            return;
        }

        try {
            // Attempt to parse the user data from the cookie
            const userData = JSON.parse(userCookie);

            // Update Redux store
            dispatch({ type: "LOGIN", payload: userData });

            // Update local component state
            setUserId(userData.id);
            setUser(userData);
        } catch (err) {
            // Handle malformed or corrupted cookie data
            console.error("❌ Failed to parse user cookie:", err);

            // Clean up corrupted data
            Cookies.remove("user");
            dispatch({ type: "LOGOUT" });

            // Redirect to login page
            navigate("/login");
        }
    }, [navigate, setUserId, setUser, dispatch, user]);
}
