import express from 'express'
import { getAllData, login, register, update } from '../controllers/user.controller';
import { OnlyUser } from '../@types/global.types';

const router = express.Router()

//register user
router.post('/', register);

//update and update users profile
router.put('/:id', update);

//login to user
router.post('login',login)

//get all users
router.get('/',getAllData)

export default router;