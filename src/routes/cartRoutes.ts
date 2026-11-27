import { Router } from "express";
import AddProductToCartController from "../controllers/cart/add-product-to-cart-controller";
import { resolveBuyer } from "../middleware/resolveBuyer";
import RemoveProductCartController from "../controllers/cart/remove-product-cart-controller";
import GetAllItemsCartController from "../controllers/cart/get-all-items-cart-controller";

const router = Router();

router.post("/add", resolveBuyer, new AddProductToCartController().handle);
router.delete(
  "/remove",
  resolveBuyer,
  new RemoveProductCartController().handle
);
router.post("/items", resolveBuyer, new GetAllItemsCartController().handle);

export default router;
