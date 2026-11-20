import express from 'express'
import { chatWithAI as chatController, getMessageHistory,getAllChats } from '../controller/chat.controller.js'
import { validate } from '../middleware/validation.js'
import { authenticate } from '../middleware/Auth.Middleware.js';
import { chatReqSchema } from "../schema/chat.schema.js";

const router=express.Router()
router.use(authenticate)
router.post("/",validate(chatReqSchema),chatController)
router.get("/conversations",getAllChats)
router.get("/conversations/:conversationId",getMessageHistory)

export default router
