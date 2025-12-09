import { Router } from 'express';
import { authMiddleware } from '../auth/authMiddleware.js';
import { matchJobForUser } from './matchingController.js';

export const matchingRouter = Router();

matchingRouter.get('/test', (req, res) => {
  res.send('Matching router works!');
});

matchingRouter.use(authMiddleware);

matchingRouter.post('/', matchJobForUser);


