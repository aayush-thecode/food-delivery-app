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
exports.clearCart = exports.getCartByUserId = exports.create = void 0;
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const errorhandeler_middleware_1 = require("../middleware/errorhandeler.middleware");
const cart_model_1 = require("../models/cart.model");
const foodtype_model_1 = __importDefault(require("../models/foodtype.model"));
//create
exports.create = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { quantity, foodId } = req.body;
    const userId = req.user._id;
    let cart;
    if (!userId) {
        throw new errorhandeler_middleware_1.CustomError('userId is required', 404);
    }
    if (!foodId) {
        throw new errorhandeler_middleware_1.CustomError('foodId is required', 404);
    }
    cart = yield cart_model_1.Cart.findOne({ user: userId });
    if (!cart) {
        cart = new cart_model_1.Cart({ user: userId, items: [] });
    }
    const foodtype = yield foodtype_model_1.default.findById(foodId);
    if (!foodtype) {
        throw new errorhandeler_middleware_1.CustomError('food not found', 404);
    }
    const existingfood = cart.fooditems.find((item) => item.food.toString() === foodId);
    console.log("🚀 ~ create ~ existingfood:", existingfood);
    if (existingfood) {
        existingfood.quantity += Number(quantity);
    }
    else {
        cart.fooditems.push({ food: foodId, quantity });
    }
    yield cart.save();
    res.status(201).json({
        status: 'success',
        success: true,
        message: 'Food added to cart',
        data: cart
    });
}));
// get cart by userId 
exports.getCartByUserId = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const cart = yield cart_model_1.Cart.findOne({ user: userId })
        .populate('user', '-password')
        .populate('items.food');
    res.status(200).json({
        status: 'success',
        success: true,
        message: 'cart fetched successfully!',
        data: cart
    });
}));
//clear cart 
exports.clearCart = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foodId = req.params.foodId;
    if (!foodId) {
        throw new errorhandeler_middleware_1.CustomError('food not found', 404);
    }
    const userId = req.params._id;
    const cart = yield cart_model_1.Cart.findOne({ user: userId });
    if (!cart) {
        throw new errorhandeler_middleware_1.CustomError('cart is not created', 400);
    }
    yield cart_model_1.Cart.findOneAndDelete({ user: userId });
    res.status(200).json({
        success: true,
        status: 'success',
        message: 'foodItem removed from cart',
        data: null
    });
}));
