import { Router } from "express";
import DeleteFranchiseController from "../controllers/franchise/delete-franchise-controller";
import { authMiddleware } from "../middleware/adminMiddlewere";

const router = Router();

router.delete(
  "/delete",
  authMiddleware,
  new DeleteFranchiseController().handle
);

export default router;
