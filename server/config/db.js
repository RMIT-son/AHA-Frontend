require("dotenv").config();
const mongoose = require("mongoose");
const chalk = require("chalk"); // ✅ dùng require để có sẵn toàn cục
const { database } = require("./keys");

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");

        if (!database.url) throw new Error("MONGO_DB_URL is undefined!");

        await mongoose.connect(database.url);
        console.log(`${chalk.green("✓")} ${chalk.blue("MongoDB Connected!")}`);
    } catch (error) {
        console.error(`${chalk.red("X")} MongoDB connection error:`, error);
        process.exit(1);
    }
};

module.exports = connectDB;
