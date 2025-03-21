import express from 'express';
import { create, deleteCategoryById,  getAllCategory, UpdateProduct } from '../controllers/category.controller';
import { Authenticate } from '../middleware/authentication.middleware';
import { Onlyadmin } from '../@types/global.types';


const router = express.Router()

//register Category
router.post('/',Authenticate(Onlyadmin) ,create);

//update category 
router.put('/:id',Authenticate(Onlyadmin), UpdateProduct),

// delete by id 
router.delete('/:id',Authenticate(Onlyadmin) ,deleteCategoryById )

// get all categories
router.get('/', getAllCategory)


export default router; 