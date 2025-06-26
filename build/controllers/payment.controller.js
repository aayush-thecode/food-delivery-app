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
exports.verifyEsewaPayment = exports.initiateEsewaPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const payment_model_1 = __importDefault(require("../models/payment.model"));
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const errorhandeler_middleware_1 = require("../middleware/errorhandeler.middleware");
exports.initiateEsewaPayment = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, foodId, foodType, returnUrl } = req.body;
    if (!amount || !foodId || !foodType || !returnUrl) {
        throw new errorhandeler_middleware_1.CustomError('Missing required fields', 400);
    }
    const transactionUuid = (0, uuid_1.v4)();
    const payload = {
        amount,
        total_amount: amount,
        product_delivery_charge: 0,
        product_service_charge: 0,
        tax_amount: 0,
        product_code: foodId,
        transaction_uuid: transactionUuid,
        food_name: foodType,
        success_url: `${returnUrl}?status=success`,
        failure_url: `${returnUrl}?status=failure`,
        merchant_code: process.env.ESEWA_MERCHANT_ID,
    };
    try {
        // Save payment as pending in DB
        yield payment_model_1.default.create({
            amount,
            foodId,
            foodType,
            paymentMethod: 'ESEWA',
            status: 'PENDING',
            transactionUuid,
        });
        const response = yield axios_1.default.post(process.env.ESEWA_URL, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        res.status(200).json({
            status: 'success',
            message: 'Esewa payment initiated successfully',
            data: {
                payment_url: response.data.payment_url,
                transactionUuid,
            },
        });
    }
    catch (error) {
        throw new errorhandeler_middleware_1.CustomError(`Esewa payment initiation failed: ${error.message}`, 500);
    }
}));
exports.verifyEsewaPayment = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { referenceId, totalAmount, productCode, transactionUuid } = req.body;
    if (!referenceId || !totalAmount || !productCode || !transactionUuid) {
        throw new errorhandeler_middleware_1.CustomError('Missing required verification fields', 400);
    }
    const payload = {
        amount: totalAmount,
        reference_id: referenceId,
        product_code: productCode,
        merchant_code: process.env.ESEWA_MERCHANT_ID,
    };
    try {
        const response = yield axios_1.default.post(process.env.ESEWA_VERIFY_URL, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.data.status === 'SUCCESS') {
            // Update payment status in DB
            yield payment_model_1.default.findOneAndUpdate({ transactionUuid }, { status: 'SUCCESS', referenceId });
            res.status(200).json({
                status: 'success',
                message: 'Esewa payment verified successfully',
                data: response.data,
            });
        }
        else {
            yield payment_model_1.default.findOneAndUpdate({ transactionUuid }, { status: 'FAILED' });
            res.status(400).json({
                status: 'failed',
                message: 'Esewa payment verification failed',
                data: response.data,
            });
        }
    }
    catch (error) {
        throw new errorhandeler_middleware_1.CustomError(`Esewa payment verification failed: ${error.message}`, 500);
    }
}));
