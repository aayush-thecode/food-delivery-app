"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_middleware_1 = require("../middleware/authentication.middleware");
const cart_controller_1 = require("../controllers/cart.controller");
const global_types_1 = require("../@types/global.types");
const router = express_1.default.Router();
//add to crate
router.post('/add', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyUser), cart_controller_1.create);
// clear route 
router.delete('/clear', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyUser), cart_controller_1.clearCart);
//get all 
router.get('/:id', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyUser), cart_controller_1.getCartByUserId);
exports.default = router;
