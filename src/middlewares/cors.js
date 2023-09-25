import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

export const corsMiddleware = () =>
  cors({
    origin: [
      process.env.BASE_URL_DEVELOPMENT,
      process.env.BASE_URL_PRODUCTION,
      process.env.BASE_URL_FRONT_DEVELOPMENT,
      process.env.BASE_URL_FRONT_PRODUCTION,
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  });
