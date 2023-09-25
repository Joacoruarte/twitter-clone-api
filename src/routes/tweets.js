import { Router } from 'express';
import authenticateToken from '../middlewares/authenticateToken.js';
export const tweetsRouter = Router();
import { TweetsController } from '../controllers/tweets.js';

tweetsRouter.get('/', authenticateToken, TweetsController.getAll);

tweetsRouter.post('/', authenticateToken, TweetsController.create);

tweetsRouter.get('/:id', authenticateToken, TweetsController.getById);
