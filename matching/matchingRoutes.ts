import { Router } from "express";
import { authMiddleware } from "../auth/authMiddleware.js";

export const matchingRouter = Router();

matchingRouter.use(authMiddleware);

matchingRouter.post('/', (req,res) => {
    return res.json({message:'Matching endpoint works', body: req.body});
});

export default matchingRouter;