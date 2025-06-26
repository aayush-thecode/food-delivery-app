"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const router = express_1.default.Router();
router.post('/esewa/initiate', payment_controller_1.initiateEsewaPayment);
router.post('/esewa/verify', payment_controller_1.verifyEsewaPayment);
exports.default = router;
