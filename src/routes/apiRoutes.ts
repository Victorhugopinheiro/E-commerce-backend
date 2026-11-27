import { Router } from "express";
import AsaasWebhookController from "../controllers/api/asaasWebhookController";
import bodyParser from "body-parser";

const router = Router();

router.post(
  "/asaasWebhook",
  bodyParser.raw({ type: "application/json" }),
  new AsaasWebhookController().handle
);

export default router;
