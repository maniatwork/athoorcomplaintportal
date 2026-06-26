import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Athoor Complaint Portal API is active." });
});

app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }
  return res.status(err.status || 500).json({ message: err.message || "An unexpected server error occurred." });
});

export default app;
