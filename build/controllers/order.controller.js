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
exports.cancelOrder = exports.deleteOrder = exports.updateOrderStatus = exports.getUSerId = exports.getAllOrder = exports.placeOrder = void 0;
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const cart_model_1 = require("../models/cart.model");
const errorhandeler_middleware_1 = require("../middleware/errorhandeler.middleware");
const foodtype_model_1 = __importDefault(require("../models/foodtype.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const orderconfirmation_utils_1 = require("../utils/orderconfirmation.utils");
const pagination_utils_1 = require("../utils/pagination.utils");
// place food order
exports.placeOrder = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const cart = yield cart_model_1.Cart.findOne({ user: userId })
        .populate('fooditems.foodtype');
    if (!cart) {
        throw new errorhandeler_middleware_1.CustomError("cart not found", 404);
    }
    const foods = yield Promise.all(cart.fooditems.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        const foods = yield foodtype_model_1.default.findById(item.food);
        if (!foods) {
            throw new errorhandeler_middleware_1.CustomError('Food type not found', 404);
        }
        return {
            foods: item.food._id,
            quantity: item.quantity,
            totalPrice: Number(foods.price) * item.quantity
        };
    })));
    const totalAmount = foods.reduce((acc, item) => +item.totalPrice, 0);
    const order = new order_model_1.default({
        user: userId,
        items: foods,
        totalAmount
    });
    const newOrder = yield order.save();
    const populatedOrder = yield order_model_1.default.findById(newOrder._id)
        .populate("fooditems.foodtype");
    if (!populatedOrder) {
        throw new errorhandeler_middleware_1.CustomError('order not created', 404);
    }
    yield (0, orderconfirmation_utils_1.sendOrderConfirmationEmail)({
        to: req.user.semail,
        orderDetails: populatedOrder
    });
    yield cart_model_1.Cart.findByIdAndDelete(cart._id);
    res.status(201).json({
        status: 'success',
        success: true,
        message: 'order placed successfully',
        data: populatedOrder
    });
}));
//get all orders 
exports.getAllOrder = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, status, user, minAmount, maxAmount, startDate, endDate, query } = req.query;
    const currentPage = parseInt(page) || 1;
    const queryLimit = parseInt(limit) || 10;
    const skip = (currentPage - 1) * queryLimit;
    let filter = {};
    if (status) {
        filter.status = status;
    }
    if (user) {
        filter.user = user;
    }
    if (query) {
        filter.orderId = [
            {
                orderId: { regex: query, $options: 'i' }
            }
        ];
    }
    if (minAmount && maxAmount) {
        filter.totalAmount = {
            $gte: parseFloat(minAmount),
            $lte: parseFloat(maxAmount)
        };
    }
    else if (minAmount) {
        filter.totalAmount = { $gte: parseFloat(minAmount) };
    }
    else if (maxAmount) {
        filter.totalAmount = { $lte: parseFloat(maxAmount) };
    }
    //filter by date range
    if (startDate && endDate) {
        filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    else if (startDate) {
        filter.createdAt = { $gte: new Date(startDate) };
    }
    else if (endDate) {
        filter.createdAt = { $lte: new Date(endDate) };
    }
    const orders = yield order_model_1.default.find(filter)
        .skip(skip)
        .limit(queryLimit)
        .sort({ createdAt: -1 })
        .populate('fooditems.foodtype')
        .populate('user', '-password');
    const totalCount = yield order_model_1.default.countDocuments(filter);
    const pagination = (0, pagination_utils_1.getPaginationData)(currentPage, queryLimit, totalCount);
    res.status(200).json({
        success: true,
        status: 'success',
        data: {
            data: orders,
            pagination,
        },
        message: 'Orders fetched successfully!'
    });
}));
//get orders by user id
exports.getUSerId = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const orders = order_model_1.default.findOne({ user: userId })
        .populate("fooditems.foodtype")
        .populate("user", "-password");
    res.status(201).json({
        status: 'success',
        success: true,
        message: 'order fetched successfully!',
        data: orders
    });
}));
//update
exports.updateOrderStatus = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.id;
    const { status } = req.body;
    if (!status) {
        throw new errorhandeler_middleware_1.CustomError('status is required', 404);
    }
    if (!orderId) {
        throw new errorhandeler_middleware_1.CustomError('orderId is required', 400);
    }
    const updatedOrder = order_model_1.default.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!updatedOrder) {
        throw new errorhandeler_middleware_1.CustomError('order not found', 404);
    }
    res.status(201).json({
        success: true,
        status: 'success',
        message: 'order status updated successfully',
        data: updatedOrder,
    });
}));
//delete order 
exports.deleteOrder = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.id;
    if (!orderId) {
        throw new errorhandeler_middleware_1.CustomError('orderId is required', 400);
    }
    const deletedOrder = order_model_1.default.findByIdAndDelete(orderId);
    if (!deletedOrder) {
        throw new errorhandeler_middleware_1.CustomError('order not found', 404);
    }
    res.status(201).json({
        success: true,
        status: 'success',
        message: 'order deleted successfully',
        data: deletedOrder,
    });
}));
// cancel Order
exports.cancelOrder = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    const userId = req.user._id;
    const order = yield order_model_1.default.findById(orderId);
    if (!order) {
        throw new errorhandeler_middleware_1.CustomError('Order not found', 404);
    }
    if (order.user.toString() !== userId.toString()) {
        throw new errorhandeler_middleware_1.CustomError('Unauthorized access to this order', 403);
    }
    if (['delivered', 'shipped', 'cancelled'].includes(order.status)) {
        throw new errorhandeler_middleware_1.CustomError(`Order cannot be canceled when in ${order.status} status`, 400);
    }
    // Cancel the entire order
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    yield order.save();
    res.status(200).json({
        success: true,
        status: 'success',
        message: 'Order cancelled successfully!',
        data: order
    });
}));
