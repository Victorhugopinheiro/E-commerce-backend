import { Router } from "express";
import ListFranchiseController from "../controllers/franchise/list-franchise-controller";

const router = Router();

router.get("/list", new ListFranchiseController().handle);

export default router;
