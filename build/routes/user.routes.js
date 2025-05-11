"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const global_types_1 = require("../@types/global.types");
const authentication_middleware_1 = require("./../middleware/authentication.middleware");
const router = express_1.default.Router();
//register user
router.post('/', user_controller_1.register);
//update and update users profile
router.put('/:id', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyAdmin), user_controller_1.update);
//login to user
router.post('/login', user_controller_1.login);
//get all users
router.get('/', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyAdmin), user_controller_1.getAllData);
// Forgot password route
router.post('/forgot-password', user_controller_1.forgotPassword);
// Reset password route
router.post('/reset-password/:token', user_controller_1.resetPassword);
exports.default = router;
