import { Router } from "express";
import CreateReviewController from "../controllers/review/create-review-controller";
import ListReviewController from "../controllers/review/list-review-controller";
import DeleteReviewController from "../controllers/review/delete-review-controller";
import { upload } from "../middleware/multer";
import { authMiddleware } from "../middleware/adminMiddlewere";

const router = Router();

router.post(
  "/add",
  authMiddleware,
  upload.fields([
    { name: "media", maxCount: 1 },
    { name: "userImage", maxCount: 1 },
  ]),
  new CreateReviewController().handle
);
router.get("/list", new ListReviewController().handle);
router.delete("/delete", authMiddleware, new DeleteReviewController().handle);

export default router;
