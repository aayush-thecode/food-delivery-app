import express from 'express'
import { Authenticate } from '../middleware/authentication.middleware'
import { clearCart, create, getCartByUserId,  } from '../controllers/cart.controller'
import { OnlyUser } from '../@types/global.types'

const router = express.Router()

//add to crate
router.post('/add', Authenticate(OnlyUser), create)

// clear route 
router.delete('/clear', Authenticate(OnlyUser), clearCart);

//get all 
router.get('/:id', Authenticate(OnlyUser), getCartByUserId);



export default router;