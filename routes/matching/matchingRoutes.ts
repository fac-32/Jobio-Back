import { Router } from 'express';
import { matchJobForUser } from './matchingController.js';

export const matchingRouter = Router();

matchingRouter.get('/test', (req, res) => {
    res.send('Matching router works!');
});

matchingRouter.post('/', matchJobForUser);
