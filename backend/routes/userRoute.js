import express from 'express';
import { loginUser, registerUser, adminLogin, getProfile, changePassword } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
// New routes:
userRouter.post('/profile', authUser, getProfile)
userRouter.post('/change-password', authUser, changePassword)

export default userRouter;