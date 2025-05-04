"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const foodtype_controller_1 = require("../controllers/foodtype.controller");
const multer_1 = __importDefault(require("multer"));
const authentication_middleware_1 = require("../middleware/authentication.middleware");
const global_types_1 = require("../@types/global.types");
const router = express_1.default.Router();
//storage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/my-uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
//update food type by id 
router.put('/:id', (0, authentication_middleware_1.Authenticate)(global_types_1.Onlyadmin), upload.fields([
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
router.post('/', (0, authentication_middleware_1.Authenticate)(global_types_1.Onlyadmin), upload.fields([
    {
        name: 'coverImages',
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
