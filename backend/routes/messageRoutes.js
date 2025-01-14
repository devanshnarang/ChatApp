import express from 'express'
import protectMiddleware from '../middleware/authMiddleware.js';
import { sendmessageController,allMessagesController,markAsReadController } from '../controller/messageController.js';

const router=express.Router();

router.post("/",protectMiddleware,sendmessageController)
router.get("/:chatId",protectMiddleware,allMessagesController)
router.patch("/:messageId/read",markAsReadController)


export default router;