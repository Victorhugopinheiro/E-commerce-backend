import { Router } from "express";
import AddAddressController from "../controllers/address/addAddressControler";
import { authCartMiddleware } from "../middleware/authCart";


const router = Router();



router.post("/addAddress", authCartMiddleware ,new AddAddressController().handle )

export default router;