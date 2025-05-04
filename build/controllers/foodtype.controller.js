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
exports.remove = exports.updateFood = exports.getFoodById = exports.getAll = exports.create = void 0;
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const foodtype_model_1 = __importDefault(require("../models/foodtype.model"));
const errorhandeler_middleware_1 = require("../middleware/errorhandeler.middleware");
const deleteFiles_utils_1 = require("../utils/deleteFiles.utils");
const category_model_1 = __importDefault(require("../models/category.model"));
//create food type 
exports.create = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const body = req.body;
    const foodProduct = yield foodtype_model_1.default.create(body);
    const { coverImage, images } = req.files;
    if (!coverImage) {
        throw new errorhandeler_middleware_1.CustomError('cover image is required', 400);
    }
    foodProduct.coverImage = (_a = coverImage[0]) === null || _a === void 0 ? void 0 : _a.path;
    if (images && images.length > 0) {
        const imagePath = images.map((image, index) => image.path);
        foodProduct.images = imagePath;
    }
    yield foodProduct.save();
    res.status(201).json({
        status: 'success',
        success: true,
        data: foodProduct,
        message: 'foodType created successfully!'
    });
}));
// get all food type 
exports.getAll = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foodtype = yield foodtype_model_1.default.find({}).populate('createdBy');
    res.status(200).json({
        success: true,
        status: 'success',
        data: foodtype,
        message: 'foodType fetched successfully!'
    });
}));
// get food type by id
exports.getFoodById = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foodId = req.params.id;
    const foodTypeId = yield foodtype_model_1.default.findById(foodId).populate("createdBy");
    if (!foodId) {
        throw new errorhandeler_middleware_1.CustomError('food type not found please type correct food type', 400);
    }
    res.status(200).json({
        status: 'success',
        success: true,
        message: 'food fetched successfully',
        data: foodTypeId
    });
}));
//update food type by Id 
exports.updateFood = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { deletedImages, name, description, price, categoryId } = req.body;
    const foodId = req.params.id;
    const { coverImage, images } = req.files;
    const foodtype = yield foodtype_model_1.default.findByIdAndUpdate(foodId, { name, description, price }, { new: true });
    if (!foodtype) {
        throw new errorhandeler_middleware_1.CustomError('Food not found', 400);
    }
    if (categoryId) {
        const category = yield category_model_1.default.findById(categoryId);
        if (!category) {
            throw new errorhandeler_middleware_1.CustomError('category not found', 404);
        }
        foodtype.category = categoryId;
    }
    if (coverImage) {
        yield (0, deleteFiles_utils_1.deleteFiles)([foodtype.coverImage]);
        foodtype.coverImage = (_a = coverImage[0]) === null || _a === void 0 ? void 0 : _a.path;
    }
    if (deletedImages && deletedImages.length > 0) {
        yield (0, deleteFiles_utils_1.deleteFiles)(deletedImages);
        foodtype.images = foodtype.images.filter((image) => !deletedImages.include(image));
    }
    if (images && images.length > 0) {
        const imagePath = images.map((image, index) => image.path);
        foodtype.images = [...foodtype.images, ...imagePath];
    }
    yield foodtype.save();
    res.status(201).json({
        status: 'success',
        success: true,
        message: 'food type updated successfully!',
        data: foodtype
    });
}));
//delete food type by id 
exports.remove = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foodId = req.params.id;
    const foodtype = yield foodtype_model_1.default.findById(foodId);
    if (!foodtype) {
        throw new errorhandeler_middleware_1.CustomError('food delete failed', 400);
    }
    if (foodtype.images && foodtype.images.length > 0) {
        yield (0, deleteFiles_utils_1.deleteFiles)(foodtype.images);
    }
    yield foodtype_model_1.default.findByIdAndDelete(foodtype._id);
    res.status(201).json({
        success: true,
        status: 'success',
        message: 'food type deleted successfully',
        data: foodtype
    });
}));
