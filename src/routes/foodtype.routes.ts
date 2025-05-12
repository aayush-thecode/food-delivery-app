import express from 'express'
import { create, getAll, getFoodById, remove, updateFood } from '../controllers/foodtype.controller';
import multer from 'multer';
import { Authenticate } from '../middleware/authentication.middleware';
import { OnlyAdmin } from '../@types/global.types';

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
    name: 'coverImages',
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