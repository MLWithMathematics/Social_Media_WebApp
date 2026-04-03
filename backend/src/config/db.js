/**
 * config/db.js - MongoDB connection via Mongoose
 */


const mongoose = require('mongoose');
console.log("Checking URI:", process.env.MONGO_URI); // Add this!
mongoose.connect(process.env.MONGO_URI);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
