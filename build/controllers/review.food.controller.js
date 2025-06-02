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
exports.deleteFoodReviewById = exports.UpdateReview = exports.getReviewId = exports.getAllFoodReview = exports.createFoodReview = void 0;
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const errorhandeler_middleware_1 = require("../middleware/errorhandeler.middleware");
const foodtype_model_1 = __importDefault(require("../models/foodtype.model"));
const review_food_model_1 = __importDefault(require("../models/review.food.model"));
const pagination_utils_1 = require("../utils/pagination.utils");
// create new food review 
exports.createFoodReview = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const user = req.user;
    const { foodId, rating } = body;
    if (!foodId) {
        throw new errorhandeler_middleware_1.CustomError('Food Id is required', 400);
    }
    const food = yield foodtype_model_1.default.findById(foodId);
    if (!food) {
        throw new errorhandeler_middleware_1.CustomError('food Type not found', 404);
    }
    const newReview = yield review_food_model_1.default.create(Object.assign(Object.assign({}, body), { food: foodId, user: user._id }));
    food.reviews.push(newReview._id);
    const totalRating = ((food === null || food === void 0 ? void 0 : food.averageRating) * (food.reviews.length - 1)) + Number(rating);
    food.averageRating = totalRating / food.reviews.length;
    yield food.save();
    res.status(201).json({
        status: 'success',
        success: true,
        data: newReview,
        message: 'review created successfully!'
    });
}));
// getAll food review data 
exports.getAllFoodReview = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { food, page, limit, } = req.query;
    let filter = {};
    const perPage = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * perPage;
    if (food) {
        filter.food = food;
    }
    const reviews = yield review_food_model_1.default.find(filter)
        .skip(skip)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("food");
    const totalCount = yield review_food_model_1.default.countDocuments(filter);
    res.status(200).json({
        success: true,
        status: "success",
        data: {
            data: reviews,
            pagination: (0, pagination_utils_1.getPaginationData)(currentPage, perPage, totalCount),
        },
        message: "Reviews fetched successfully!",
    });
}));
//get reviews by food type Id 
exports.getReviewId = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foodId = req.params.foodId;
    const reviews = yield review_food_model_1.default.find({ food: foodId }).populate("user");
    res.status(200).json({
        status: 'success',
        success: true,
        message: 'review data fetched successfully!',
        data: reviews,
    });
}));
//update review by food id 
exports.UpdateReview = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rating, reviewId, foodId, comment } = req.body;
    if (!reviewId || !foodId) {
        throw new errorhandeler_middleware_1.CustomError('product Id and food Id is required', 400);
    }
    const food = yield foodtype_model_1.default.findById(foodId);
    if (!food) {
        throw new errorhandeler_middleware_1.CustomError('Food not found', 404);
    }
    const review = yield review_food_model_1.default.findById(reviewId);
    if (!review) {
        throw new errorhandeler_middleware_1.CustomError('Review not found', 404);
    }
    if (review.user.toString() !== req.user._id.toString()) {
        throw new errorhandeler_middleware_1.CustomError("Not authorized to modify this review", 403);
    }
    //store the old rating before updating new review 
    const oldRating = review.rating;
    //update review feilds
    if (rating !== undefined) {
        const totalRating = ((food.averageRating * food.reviews.length) - oldRating + rating) / food.reviews.length;
        food.averageRating = totalRating;
        yield food.save();
    }
    if (comment !== undefined)
        review.review = comment;
    yield review.save();
    //update the average rating 
    const totalRating = ((food.averageRating * food.reviews.length) - oldRating + rating) / food.reviews.length;
    food.averageRating = totalRating;
    yield food.save();
    res.status(200).json({
        status: 'success',
        success: true,
        data: review,
        message: 'review updated successfully'
    });
}));
//delete review by foodId
exports.deleteFoodReviewById = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, foodId } = req.body;
    if (!userId || !foodId) {
        throw new errorhandeler_middleware_1.CustomError('food Id and user Id are required', 400);
    }
    const food = yield foodtype_model_1.default.findById(foodId);
    if (!food) {
        throw new errorhandeler_middleware_1.CustomError('food not found', 404);
    }
    const review = yield review_food_model_1.default.findOne({ food: foodId, user: userId });
    if (!review) {
        throw new errorhandeler_middleware_1.CustomError("review not found", 404);
    }
    yield review_food_model_1.default.findByIdAndDelete(review._id);
    if (review.user.toString() !== req.user._id.toString()) {
        throw new errorhandeler_middleware_1.CustomError("Not authorized to modify this review", 403);
    }
    food.reviews.pull(review._id);
    const remainingReviews = food.reviews.length;
    // recalculate average rating
    if (remainingReviews === 0) {
        food.averageRating = 0;
    }
    else {
        const totalRating = (food.averageRating * (remainingReviews + 1)) - review.rating;
        food.averageRating = totalRating / remainingReviews;
    }
    yield food.save();
    res.status(200).json({
        status: 'successful',
        success: true,
        message: 'food Review deleted successfully',
    });
}));
