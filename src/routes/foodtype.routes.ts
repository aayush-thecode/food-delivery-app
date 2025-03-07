import express from 'express'
import { create, getAll, getFoodById, remove, updateFood } from '../controllers/foodtype.controller';
import multer from 'multer';

const router = express.Router()

//storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({storage: storage})

//register user
router.post('/', upload.single('coverImage'), create);

// get all food types
router.get('/', getAll);

//get all food type by id 
router.get('/:id', getFoodById);

//update food type by id 
router.put('/:id', updateFood);

//delete food type by id 
router.delete('/:id', remove)

export default router; 