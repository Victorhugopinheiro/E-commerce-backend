import { Router } from "express";
import WebhookController from "../controllers/api/webhookController";
import AsaasWebhookController from "../controllers/api/asaasWebhookController";
import bodyParser from "body-parser";

const router = Router();

router.post(
  "/call",
  bodyParser.raw({ type: "application/json" }),
  new WebhookController().handle
);
router.post(
  "/asaasWebhook",
  bodyParser.raw({ type: "application/json" }),
  new AsaasWebhookController().handle
);

export default router;
