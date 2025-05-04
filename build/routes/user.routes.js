"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
//register user
router.post('/', user_controller_1.register);
//update and update users profile
router.put('/:id', user_controller_1.update);
//login to user
router.post('login', user_controller_1.login);
//get all users
router.get('/', user_controller_1.getAllData);
exports.default = router;
