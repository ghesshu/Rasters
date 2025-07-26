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
import routes from "./routes";

// DB connection
mongoose
  .set("strictQuery", false)
  .connect(DB_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(() => console.log(`Connected to DB at ${DB_URI}`))
  .catch((error) => console.error(error));

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morganMiddleware);

app.get("/", (req, res) => {
  res.send("API server started");
});
app.use("/api/auth", routes.AuthRouter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/", chatRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
console.log(PORT);
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  logger.info(`Client URL: ${config.clientUrl}`);
});

export default app;
