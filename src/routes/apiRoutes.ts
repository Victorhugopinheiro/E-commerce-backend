import { Router } from "express";
import WebhookController from "../controllers/api/webhookController";
import AsaasWebhookController from "../controllers/api/asaasWebhookController";
import { authMiddleware } from "../middleware/adminMiddlewere";
import { authCartMiddleware } from "../middleware/authCart";
import bodyParser from "body-parser";


const router = Router();



router.post("/call", authCartMiddleware, bodyParser.raw({type: 'application/json'}), new WebhookController().handle);  
router.post("/asaasWebhook", bodyParser.raw({type: 'application/json'}), new AsaasWebhookController().handle);

export default router;