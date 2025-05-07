"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const authentication_middleware_1 = require("../middleware/authentication.middleware");
const global_types_1 = require("../@types/global.types");
const router = express_1.default.Router();
//register Category
router.post('/', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyAdmin), category_controller_1.create);
//update category 
router.put('/:id', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyAdmin), category_controller_1.UpdateProduct),
    // delete by id 
    router.delete('/:id', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyAdmin), category_controller_1.deleteCategoryById);
// get all categories
router.get('/', category_controller_1.getAllCategory);
exports.default = router;
