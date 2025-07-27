import { useEffect } from "react";
import Cookies from "js-cookie";

/**
 * Custom hook for handling user authentication and session management
 *
 * This hook automatically checks for user authentication when the component mounts
 * by validating the presence and integrity of user session data stored in cookies.
 * If authentication fails, it redirects the user to the login page.
 *
 * @param {Function} navigate - React Router navigation function for programmatic routing
 * @param {Function} setUserId - State setter function to update the current user ID
 * @param {Function} setUser - State setter function to update the current user object
 *
 * @example
 * // Usage in a component
 * const navigate = useNavigate();
 * const [userId, setUserId] = useState(null);
 * const [user, setUser] = useState(null);
 *
 * useAuth(navigate, setUserId, setUser);
 *
 * @author Your Team Name
 * @since 1.0.0
 */
export default function useAuth(navigate, setUserId, setUser) {
    useEffect(() => {
        /**
         * Authentication validation effect
         * Runs once when the component mounts to verify user session
         */

        // Retrieve user session data from browser cookies
        const userCookie = Cookies.get("user");

        // Check if user session exists
        if (!userCookie) {
            // No session found - user is not authenticated
            alert("Please log in to access the chat.");
            navigate("/login");
            return;
        }

        try {
            // Attempt to parse the user data from the cookie
            // Cookie should contain JSON-stringified user object
            const userData = JSON.parse(userCookie);

            // Extract and set user information in application state
            setUserId(userData.id);
            setUser(userData);
        } catch (err) {
            // Handle malformed or corrupted cookie data
            console.error("❌ Failed to parse user cookie:", err);

            // Redirect to login page if cookie is invalid
            // This ensures security by not allowing corrupted sessions
            navigate("/login");
        }
    }, [navigate, setUserId, setUser]); // Dependencies: re-run if any of these functions change
}

/**
 * Expected cookie structure:
 * {
 *   "user": "{\"id\": \"user123\", \"email\": \"user@example.com\", \"name\": \"John Doe\"}"
 * }
 *
 * Security considerations:
 * - Cookie validation prevents session hijacking with malformed data
 * - Automatic logout on cookie corruption or absence
 * - Error logging for debugging authentication issues
 *
 * Dependencies:
 * - js-cookie: For secure cookie management
 * - react-router-dom: For navigation functionality
 */
