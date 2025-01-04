import express from 'express'
import protectMiddleware from '../middleware/authMiddleware.js';
import { sendmessageController,allMessagesController } from '../controller/messageController.js';

const router=express.Router();

router.post("/",protectMiddleware,sendmessageController)
router.get("/:chatId",protectMiddleware,allMessagesController)

export default router;