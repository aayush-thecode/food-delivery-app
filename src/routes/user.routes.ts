import express from 'express'
import { getAllData, login, register, update } from '../controllers/user.controller';
import { OnlyAdmin } from '../@types/global.types';
import { Authenticate } from './../middleware/authentication.middleware';

const router = express.Router()

//register user
router.post('/', register);

//update and update users profile
router.put('/:id',Authenticate(OnlyAdmin), update);

//login to user
router.post('/login',login)

//get all users
router.get('/', Authenticate(OnlyAdmin),getAllData)

export default router;