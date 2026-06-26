import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`Express Server started successfully!`);
  console.log(`Listening on Port: ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
