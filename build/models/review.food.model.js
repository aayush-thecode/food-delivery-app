"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    rating: {
        type: Number,
        required: [true, 'rating is required'],
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: [true, 'Review is required'],
        trim: true
    },
    user: {
        type: mongoose_1.default.Types.ObjectId,
        required: [true, 'user is required'],
        ref: 'user'
    },
    food: {
        type: mongoose_1.default.Types.ObjectId,
        required: [true, "Food is required"],
        ref: "foodtype",
    }
}, { timestamps: true });
const Review = mongoose_1.default.model('review', reviewSchema);
exports.default = Review;
