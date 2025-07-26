interface Config {
    port: number;
    nodeEnv: string;
    clientUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    mongoUri: string;
}

export const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/rasters'
}; 