require('dotenv').config();
const url = process.env.MONGODB_URL;
const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.set('strictQuery', false)
    try {
        await mongoose.connect(url, () => console.log("Database connection established!"))
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

module.exports = connectDB