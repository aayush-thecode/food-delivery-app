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
exports.deleteCategoryById = exports.UpdateProduct = exports.getAllCategory = exports.create = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const errorhandeler_middleware_1 = require("../middleware/errorhandeler.middleware");
const pagination_utils_1 = require("../utils/pagination.utils");
//create category 
exports.create = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const category = yield category_model_1.default.create(body);
    res.status(201).json({
        status: 'success',
        success: true,
        data: category,
        message: 'Category created successfully!'
    });
}));
//get all foodType data 
exports.getAllCategory = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, query } = req.query;
    const currentPage = parseInt(page) || 1;
    const queryLimit = parseInt(limit) || 10;
    const skip = (currentPage - 1) * queryLimit;
    let filter = {};
    if (query) {
        filter.$or = [
            {
                name: { $regex: query, $options: 'i' },
            },
            {
                description: { $regex: query, $options: 'i' },
            }
        ];
    }
    const categories = yield category_model_1.default.find(filter)
        .skip(skip)
        .limit(queryLimit)
        .sort({ createdAt: -1 });
    const totalCount = yield category_model_1.default.countDocuments(filter);
    const pagination = (0, pagination_utils_1.getPaginationData)(currentPage, queryLimit, totalCount);
    res.status(200).json({
        success: true,
        status: 'success',
        data: {
            data: categories,
            pagination,
        },
        message: 'category fetched successfully!'
    });
}));
//update category by product id
exports.UpdateProduct = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foodId = req.params.id;
    if (!foodId) {
        throw new errorhandeler_middleware_1.CustomError('category is required', 400);
    }
    const { name, description } = req.body;
    const category = yield category_model_1.default.findByIdAndUpdate(foodId, {
        name,
        description
    }, { new: true });
    if (!category_model_1.default) {
        throw new errorhandeler_middleware_1.CustomError('category not found', 400);
    }
    res.status(201).json({
        status: 'success',
        success: true,
        message: 'category Updated successfully',
        data: category
    });
}));
//delete categoryby Id 
exports.deleteCategoryById = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const CategoryId = req.params.id;
    if (!CategoryId) {
        throw new errorhandeler_middleware_1.CustomError(' Id is required', 404);
    }
    const deleteCategoryById = yield category_model_1.default.findByIdAndDelete(CategoryId);
    if (!deleteCategoryById) {
        throw new errorhandeler_middleware_1.CustomError('Food not found', 404);
    }
    res.status(200).json({
        status: 'success',
        success: true,
        message: 'Product deleted successfully!',
        data: deleteCategoryById,
    });
}));
