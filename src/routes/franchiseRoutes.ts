import { Router } from "express";
import CreateFranchiseController from "../controllers/franchise/create-franchise-controller";
import { authMiddleware } from "../middleware/adminMiddlewere";

const router = Router();

router.post("/add", authMiddleware, new CreateFranchiseController().handle);

export default router;
