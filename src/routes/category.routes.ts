import express from 'express';
import { create, deleteCategoryById,  getAllCategory, UpdateProduct } from '../controllers/category.controller';
import { Authenticate } from '../middleware/authentication.middleware';
import { OnlyAdmin } from '../@types/global.types';


const router = express.Router()

//register Category
router.post('/',Authenticate(OnlyAdmin) ,create);

//update category 
router.put('/:id',Authenticate(OnlyAdmin), UpdateProduct),

// delete by id 
router.delete('/:id',Authenticate(OnlyAdmin) ,deleteCategoryById )

// get all categories
router.get('/', getAllCategory)


export default router; 