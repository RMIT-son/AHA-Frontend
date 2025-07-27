import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const NotLoggedInRoutes = () => {
    const user = useSelector((state) => state.user); // Fixed: only get user state
    return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default NotLoggedInRoutes;
