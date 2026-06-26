import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error("MONGODB_URI environment variable is not defined in the backend/.env file.");
    }
    
    const conn = await mongoose.connect(connStr);
    
    console.log(`\n==================================================`);
    console.log(`MongoDB Connected successfully!`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`==================================================\n`);
  } catch (error) {
    console.error(`\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.error(`MongoDB connection failure!`);
    console.error(`Error: ${error.message}`);
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n`);
    process.exit(1);
  }
};

export default connectDB;
