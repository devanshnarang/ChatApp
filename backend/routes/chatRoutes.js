import express from 'express'
import protectMiddleware from '../middleware/authMiddleware.js';
import { accessChatsController, fetchChatsController, creategroupChatController, renameGroupController, groupAddController, removeFromGroupController } from '../controller/ChatControllers.js';

const router=express.Router();

router.post("/",protectMiddleware,accessChatsController);
router.get("/",protectMiddleware,fetchChatsController);

router.post("/group",protectMiddleware,creategroupChatController);
router.put("/rename",protectMiddleware,renameGroupController);
router.post("/groupremove",protectMiddleware,removeFromGroupController);
router.post("/groupAdd",protectMiddleware,groupAddController);

export default router;