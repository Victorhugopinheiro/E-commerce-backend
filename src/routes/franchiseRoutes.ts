import { Router } from "express";
import CreateFranchiseController from "../controllers/franchise/create-franchise-controller";
import DeleteFranchiseController from "../controllers/franchise/delete-franchise-controller";
import ListFranchiseController from "../controllers/franchise/list-franchise-controller";
import { authMiddleware } from "../middleware/adminMiddlewere";

const router = Router();

router.post("/add", authMiddleware, new CreateFranchiseController().handle);
router.delete(
  "/delete",
  authMiddleware,
  new DeleteFranchiseController().handle
);
router.get("/list", new ListFranchiseController().handle);

export default router;
