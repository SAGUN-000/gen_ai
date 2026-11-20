import express from 'express';
import { chatWithAI as chatController } from '../controller/chat.controller.js';
import { validate } from '../middleware/validation.js';
import { chatReqSchema } from "../schema/chat.schema.js";
const router = express.Router();
router.post("/chat", validate(chatReqSchema), chatController);
export default router;
//# sourceMappingURL=chat.routes.js.map