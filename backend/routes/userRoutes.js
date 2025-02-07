import express from 'express';
import { allUserController, handleBackupController, loginController,registrationController, savePublicKeyController,getPublicKeyController } from '../controller/userController.js';
import protectMiddleware from '../middleware/authMiddleware.js';

const router=express.Router();

router.post('/login',loginController);

router.post('/register',registrationController);

router.get("/",protectMiddleware,allUserController);

router.post("/handle-backup",protectMiddleware,handleBackupController);
router.post("/save-public-key",protectMiddleware,savePublicKeyController);
router.post("/getting-public-key",protectMiddleware,getPublicKeyController);


export default router;