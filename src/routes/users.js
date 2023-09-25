import { Router } from 'express';
import { UsersController } from '../controllers/users.js';
import authenticateToken from '../middlewares/authenticateToken.js';

export const usersRouter = Router();

usersRouter.get('/', UsersController.getAll);

usersRouter.get('/context', authenticateToken, UsersController.getUserByContext);

usersRouter.get('/:id', UsersController.getById);

usersRouter.post('/checks', UsersController.checkIfUserExists);

usersRouter.post('/login', UsersController.logIn)

usersRouter.post('/register', UsersController.register)

usersRouter.get('/:id/followers', UsersController.getFollowersByUserId);