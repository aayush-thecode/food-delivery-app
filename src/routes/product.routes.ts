import express from 'express'
import { create, getAll } from '../controllers/product.controller';

const router = express.Router()

//register user
router.post('/', create);

router.get('/', getAll)
export default router; 