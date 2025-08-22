require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middlewares/errorMiddleware");
const authRouter = require("./routes/auth");
const adminUsersRouter = require("./routes/adminUsers");
const { connectDb } = require("./config/db");

const app = express();

/// ===== Security Middleware =====
app.use(helmet()); // Secure HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // your frontend
    credentials: true, // allow cookies
  })
);

// ===== Body & Cookie Parsing =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== Logging =====
app.use(morgan("dev"));

// ===== Rate Limiting =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per window
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// ===== Routes =====
app.use("/api/users", authRouter);
app.use("/api/admin", adminUsersRouter);

// ===== Test Root Route =====
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running securely 🚀" });
});


// ===== Connect DB and Start Server =====
const PORT = process.env.PORT || 5000;
connectDb();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ===== Error Handler =====
app.use(errorHandler); 


