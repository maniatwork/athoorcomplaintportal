import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error("MONGODB_URI environment variable is not defined in the backend/.env file.");
    }
    
    const isAtlas = connStr.includes("mongodb+srv") || connStr.includes("mongodb.net");
    const conn = await mongoose.connect(connStr);
    
    console.log(`\n==================================================`);
    if (isAtlas) {
      console.log(`Connected to MongoDB Atlas`);
    }
    console.log(`MongoDB Connection Successful`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`==================================================\n`);
  } catch (error) {
    console.error(`\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.error(`MongoDB Connection Failed`);
    console.error(`Error: ${error.message}`);
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n`);
    process.exit(1);
  }
};

export default connectDB;
