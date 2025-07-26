import { config } from "dotenv";
config();
/**
 * Better use this to export our API keys rather than using process.env.xxx everywhere
 */
export const PORT = process.env.PORT;
export const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/rasters_db";
export const JWT_SECRET = process.env.JWT_SECRET;
export const RASTER_GMAIL = process.env.RASTER_GMAIL;
export const RASTER_GMAIL_PASSWORD = process.env.RASTER_GMAIL_PASSWORD;