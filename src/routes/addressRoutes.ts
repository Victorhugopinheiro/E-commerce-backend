import { Router } from "express";
import AddAddressController from "../controllers/address/addAddressControler";
import { authCartMiddleware } from "../middleware/authCart";
import ChangePrimaryAddressController from "../controllers/address/ChangePrimaryAddressController";


const router = Router();



router.post("/addAddress", authCartMiddleware ,new AddAddressController().handle )
router.post("/changePrimaryAddress/:addressId", authCartMiddleware ,new ChangePrimaryAddressController().handle )

export default router;