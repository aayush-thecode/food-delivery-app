import express from 'express'
import { create, getAll } from '../controllers/product.controller';
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


router.get('/', getAll);

export default router; 