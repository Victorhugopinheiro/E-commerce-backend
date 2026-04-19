import { Router } from "express";
import WebhookController from "../controllers/api/webhookController";
import { authMiddleware } from "../middleware/adminMiddlewere";
import { authCartMiddleware } from "../middleware/authCart";


const route = Router();
const bodyParser = require('body-parser');


route.post("/call", bodyParser.raw({type: 'application/json'}), new WebhookController().handle);  


export default route;