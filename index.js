// api/index.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-iota-lovat-88.vercel.app",
];
const cors = require("cors");

const app = express();
app.use(cors()); // Allow all origins

// Alternatively, restrict to specific origin
// app.use(cors({ origin: "http://localhost:3000" }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Set up routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
app.use("/auth", authRoutes);

module.exports = app; // Export the app for Vercel serverless functions
