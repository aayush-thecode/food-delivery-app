import express from 'express'
import { forgotPassword, getAllData, login, register, resetPassword, update } from '../controllers/user.controller';
import { OnlyAdmin } from '../@types/global.types';
import { Authenticate } from './../middleware/authentication.middleware';

const router = express.Router()

//register user
router.post('/', register);

//update and update users profile
router.put('/:id',Authenticate(OnlyAdmin), update);

//login to user
router.post('/login', login)

//get all users
router.get('/', Authenticate(OnlyAdmin),getAllData)

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Reset password route
router.post('/reset-password/:token', resetPassword);

export default router;