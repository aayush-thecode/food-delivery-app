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
    const { userId, foodTypeId, rating } = body;
    if (!userId || !foodTypeId) {
        throw new errorhandeler_middleware_1.CustomError('user Id and Food type Id is required', 400);
    }
    const food = yield foodtype_model_1.default.findById(foodTypeId);
    if (!food) {
        throw new errorhandeler_middleware_1.CustomError('food Type not fpund', 404);
    }
    const newReview = yield review_food_model_1.default.create(Object.assign(Object.assign({}, body), { foodType: foodTypeId, user: userId }));
    food.reviews.push(newReview._id);
    const totalRating = ((food === null || food === void 0 ? void 0 : food.averageRating) * (foodTypeId.reviews.length + 1)) + Number(rating);
    foodTypeId.averageRating = totalRating / foodTypeId.reviews.length;
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
    const { rating, page, limit, query, foodType } = req.query;
    const currentPage = parseInt(page) || 1;
    const queryLimit = parseInt(limit) || 10;
    const skip = (currentPage - 1) * queryLimit;
    let filter = {};
    if (rating) {
        filter.rating = parseInt(rating);
    }
    if (foodType) {
        filter.foodType = foodType;
    }
    if (query) {
        filter.$or = [
            {
                review: { $regex: query, $options: 'i' },
            }
        ];
    }
    const reviews = yield review_food_model_1.default.find(filter)
        .skip(skip)
        .limit(queryLimit)
        .sort({ createdAt: -1 })
        .populate('fooditems.foodtype')
        .populate('user');
    const totalCount = yield review_food_model_1.default.countDocuments(filter);
    const pagination = (0, pagination_utils_1.getPaginationData)(currentPage, queryLimit, totalCount);
    res.status(200).json({
        success: true,
        status: 'success',
        data: {
            data: reviews,
            pagination,
        },
        message: 'review fetched successfully!'
    });
}));
//get reviews by food type Id 
exports.getReviewId = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { foodId } = req.params;
    if (!foodId) {
        throw new errorhandeler_middleware_1.CustomError('review data not found', 400);
    }
    const food = yield review_food_model_1.default.findById(foodId);
    if (!food) {
        throw new errorhandeler_middleware_1.CustomError('food not found', 404);
    }
    // find reviews for the given foodId 
    const reviews = yield review_food_model_1.default.find({ food: foodId });
    res.status(200).json({
        status: 'success',
        success: true,
        message: 'review data fetched successfully!',
        data: reviews,
    });
}));
//update review by food id 
exports.UpdateReview = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rating, ReviewId, foodId, comment } = req.body;
    if (!ReviewId || !foodId) {
        throw new errorhandeler_middleware_1.CustomError('product Id and food Id is required', 400);
    }
    const food = yield foodtype_model_1.default.findById(foodId);
    if (!food) {
        throw new errorhandeler_middleware_1.CustomError('Food not found', 404);
    }
    const review = yield review_food_model_1.default.findById(ReviewId);
    if (!review) {
        throw new errorhandeler_middleware_1.CustomError('Review not found', 404);
    }
    //store the old rating before updating new review 
    const oldRating = review.rating;
    //update review feilds
    if (rating !== undefined)
        review.rating = rating;
    if (comment !== undefined)
        review.review = comment;
    yield review.save();
    //update the average rating 
    const totalRating = ((food === null || food === void 0 ? void 0 : food.averageRating) * food.reviews.length - oldRating + rating) / food.reviews.length;
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
    food.reviews.pull(food.reviews.filter((id) => id.toString() !== review._id.toString()));
    // recalculate average rating
    if (food.reviews.length === 0) {
        food.averageRating = 0;
    }
    else {
        const totalRating = (food.averageRating * (food.reviews.length + 1)) - review.rating;
        food.averageRating = totalRating / food.reviews.length;
    }
    yield food.save();
    res.status(200).json({
        status: 'successful',
        success: true,
        message: 'food Review deleted successfully',
    });
}));
