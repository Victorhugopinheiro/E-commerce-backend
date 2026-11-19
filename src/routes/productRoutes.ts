import { NextFunction, Request, Response, Router } from "express";
import AddProductController from "../controllers/product/add-product-controller";
import { upload } from "../middleware/multer";
import ListProductController from "../controllers/product/list-product-controller";
import DeleteProductController from "../controllers/product/delete-product-controller";
import DetailProductController from "../controllers/product/detail-product-controller";
import HomeShowcaseController from "../controllers/product/home-showcase-controller";
import { authMiddleware } from "../middleware/adminMiddlewere";

const router = Router();

const uploadProductImages = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "modelImages", maxCount: 30 },
  ])(req, res, (err: unknown) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "Imagens de modelo inválidas",
      });
    }
    next();
  });
};

router.post(
  "/add",
  authMiddleware,
  uploadProductImages,
  new AddProductController().handle
);

router.get("/list", new ListProductController().handle);

router.get("/showcase", new HomeShowcaseController().handle);

router.delete("/delete", authMiddleware, new DeleteProductController().handle);

router.get("/detail", authMiddleware, new DetailProductController().handle);

export default router;
