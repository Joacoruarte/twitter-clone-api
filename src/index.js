import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded } from 'express';
import { tweetsRouter } from './routes/tweets.js';
import { usersRouter } from './routes/users.js';
const port = process.env.PORT ?? 3001;
import './db.js';
import { corsMiddleware } from './middlewares/cors.js';

const app = express();

app.disable('x-powered-by');
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(corsMiddleware());
app.get('/', (req, res) => res.json({ message: 'Hello World' }));
app.use('/tweets', tweetsRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
