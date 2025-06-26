"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const payment_types_1 = require("../@types/payment.types");
const paymentSchema = new mongoose_1.default.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive'],
    },
    foodId: {
        type: String,
        required: [true, 'Food ID is required'],
    },
    foodType: {
        type: String,
        required: [true, 'Food type is required'],
        maxlength: [100, 'Food type cannot exceed 100 characters'],
    },
    paymentMethod: {
        type: String,
        enum: Object.values(payment_types_1.PaymentMethod),
        default: payment_types_1.PaymentMethod.ESEWA,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(payment_types_1.PaymentStatus),
        default: payment_types_1.PaymentStatus.PENDING,
    },
    transactionUuid: {
        type: String,
        required: [true, 'Transaction UUID is required'],
        unique: true,
    },
    referenceId: {
        type: String,
    },
}, { timestamps: true });
const Payment = mongoose_1.default.model("Payment", paymentSchema);
exports.default = Payment;
