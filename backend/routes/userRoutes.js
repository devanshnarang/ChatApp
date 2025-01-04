import express from 'express';
import { allUserController, loginController,registrationController } from '../controller/userController.js';
import protectMiddleware from '../middleware/authMiddleware.js';

const router=express.Router();

router.post('/login',loginController);

router.post('/register',registrationController);

router.get("/",protectMiddleware,allUserController);

export default router;