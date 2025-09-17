import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config";
import { errorHandler } from "./middleware/error.middleware";
import { logger, morganMiddleware } from "./utils/logger";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import chatRoutes from "./routes/chat.routes";
import mongoose, { ConnectOptions } from "mongoose";
import { DB_URI } from "./config/constants";
// Remove this unused import
// import routes from "./routes";
import { requestResponseLogger } from "./middleware/request-logger.middleware";
import cookieParser from "cookie-parser";

// DB connection
mongoose
  .set("strictQuery", false)
  .connect(DB_URI!)
  .then(() => logger.info(`Connected to DB at ${DB_URI}`))
  .catch((error) => console.error(error));

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);

// Body parsing middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// // Logging middleware
// app.use(morganMiddleware);
// // Add detailed request/response logger
// app.use(requestResponseLogger);

// REQUEST LOGGING MIDDLEWARE
app.use((req, res, next) => {
  const start = Date.now();

  // Log the incoming request
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Log the response when it finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
});

app.get("/", (req, res) => {
  res.send("API server started");
});

// Add this health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// app.use("/api/auth", routes.AuthRouter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/", chatRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
logger.info(PORT);
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  logger.info(`Client URL: ${config.clientUrl}`);
});

export default app;
