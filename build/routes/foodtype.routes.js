"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const foodtype_controller_1 = require("../controllers/foodtype.controller");
const multer_1 = __importDefault(require("multer"));
const authentication_middleware_1 = require("../middleware/authentication.middleware");
const global_types_1 = require("../@types/global.types");
const cloudinary_config_1 = require("../config/cloudinary.config");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const router = express_1.default.Router();
//storage
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_config_1.cloudinary,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            folder: 'food-delivery/foodtype',
            allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
        };
    }),
});
const upload = (0, multer_1.default)({ storage: storage });
//update food type by id 
router.put('/:id', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyAdmin), upload.fields([
    {
        name: 'coverImage',
        maxCount: 1
    },
    {
        name: 'images',
        maxCount: 6,
    }
]), foodtype_controller_1.updateFood);
// create foodType
router.post('/', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyAdmin), upload.fields([
    {
        name: 'coverImage',
        maxCount: 1,
    },
    {
        name: 'images',
        maxCount: 6
    }
]), foodtype_controller_1.create);
// get all food types
router.get('/', foodtype_controller_1.getAll);
//get all food type by id 
router.get('/:id', foodtype_controller_1.getFoodById);
//delete food type by id 
router.delete('/:id', foodtype_controller_1.remove);
exports.default = router;
