import express from 'express'
import { create, getAll, getFoodById, remove, updateFood } from '../controllers/foodtype.controller';
import multer from 'multer';
import { Authenticate } from '../middleware/authentication.middleware';
import { OnlyAdmin } from '../@types/global.types';
import { cloudinary } from '../config/cloudinary.config';
import { CloudinaryStorage } from 'multer-storage-cloudinary'

const router = express.Router()

//storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'food-delivery/foodtype',
      allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
    };
  },
});

const upload = multer({storage: storage})

//update food type by id 

router.put('/:id',Authenticate(OnlyAdmin), upload.fields ([
  {
    name: 'coverImage',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 6,
  }
]),
updateFood);

// create foodType

router.post('/',Authenticate(OnlyAdmin), upload.fields ([
  {
    name: 'coverImage',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 6
  }
]), create);

// get all food types
router.get('/', getAll);

//get all food type by id 
router.get('/:id', getFoodById);

//delete food type by id 
router.delete('/:id', remove)

export default router; 