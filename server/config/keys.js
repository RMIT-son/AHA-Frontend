module.exports = {
    app: {
        name: "AHA-Capstone ", // App name
        serverURL: `${process.env.BASE_API_URL}`, // Base API URL
        clientURL: process.env.CLIENT_URL, // Client URL
        // Will implement others API link for data later
    },
    port: process.env.PORT || 3000, // Server port
    database: {
        url: process.env.MONGO_DB_URL, // MongoDB connection URL
    },
    jwt: {
        secret: process.env.JWT_SECRET, // JWT secret key
        tokenLife: "7d", // JWT token life
    },
};
