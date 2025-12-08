import { Router } from "express";
import { authMiddleware } from "../auth/authMiddleware.js";
import { matchJobForUser } from "./matchingController.js";

export const matchingRouter = Router();

matchingRouter.use(authMiddleware);

matchingRouter.post('/', matchJobForUser);

export default matchingRouter;