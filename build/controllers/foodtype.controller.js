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
const pagination_utils_1 = require("../utils/pagination.utils");
//create food type 
exports.create = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, description, category: categoryId } = req.body;
    const admin = req.user;
    const files = req.files;
    if (!files || !files.coverImage) {
        throw new errorhandeler_middleware_1.CustomError("Cover image is required", 400);
    }
    const coverImage = files.coverImage;
    const images = files.images;
    // get category
    const category = yield category_model_1.default.findById(categoryId);
    if (!category) {
        throw new errorhandeler_middleware_1.CustomError(" Food Category not found", 404);
    }
    const food = new foodtype_model_1.default({
        name,
        price,
        description,
        createdBy: admin._id,
        category: category._id,
    });
    food.coverImage = {
        path: coverImage[0].path,
        public_id: coverImage[0].filename
    };
    if (images && images.length > 0) {
        const imagePath = images.map((image, index) => {
            return {
                path: image.path,
                public_id: image.filename
            };
        });
        food.images = [...food.images, ...imagePath];
    }
    yield food.save();
    res.status(201).json({
        status: "success",
        success: true,
        data: food,
        message: "Food type created successfully!",
    });
}));
// get all food type 
exports.getAll = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, query, category, minPrice, maxPrice, sortBy = "createdAt", order = "DESC", } = req.query;
    const queryLimit = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * queryLimit;
    let filter = {};
    if (category) {
        filter.category = category;
    }
    if (minPrice && maxPrice) {
        filter.price = {
            $lte: parseFloat(maxPrice),
            $gte: parseFloat(minPrice),
        };
    }
    if (query) {
        filter.$or = [
            {
                name: { $regex: query, $options: "i" },
            },
            {
                description: { $regex: query, $options: "i" },
            },
        ];
    }
    const foods = yield foodtype_model_1.default.find(filter)
        .skip(skip)
        .limit(queryLimit)
        .populate("createdBy", '-password')
        .populate("category")
        .sort({ [sortBy]: order === "DESC" ? -1 : 1 });
    const totalCount = yield foodtype_model_1.default.countDocuments(filter);
    const pagination = (0, pagination_utils_1.getPaginationData)(currentPage, queryLimit, totalCount);
    res.status(200).json({
        success: true,
        status: "success",
        data: {
            data: foods,
            pagination,
        },
        message: "foods fetched successfully!",
    });
}));
// get food type by id
exports.getFoodById = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foodId = req.params.id;
    const foodTypeId = yield foodtype_model_1.default.findById(foodId).populate("createdBy");
    if (!foodId) {
        throw new errorhandeler_middleware_1.CustomError('food type not found please type correct food type', 404);
    }
    res.status(201).json({
        status: 'success',
        success: true,
        message: 'food fetched successfully',
        data: foodTypeId
    });
}));
//update food type by Id 
exports.updateFood = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        foodtype.coverImage = {
            path: coverImage[0].path,
            public_id: coverImage[0].filename
        };
    }
    if (deletedImages && deletedImages.length > 0) {
        yield (0, deleteFiles_utils_1.deleteFiles)(deletedImages);
        foodtype.images = foodtype.images.filter((image) => !deletedImages.includes(image.public_id));
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
    var _a;
    const foodId = req.params.id;
    const foodtype = yield foodtype_model_1.default.findByIdAndDelete(foodId);
    if (!foodtype) {
        throw new errorhandeler_middleware_1.CustomError('food type not found', 404);
    }
    if (foodtype.coverImage) {
        // @ts-expect-error 
        yield (0, deleteFiles_utils_1.deleteFiles)([(_a = product.coverImage) === null || _a === void 0 ? void 0 : _a.public_id]);
    }
    //delete assosiated images if they exist
    const imagesToDelete = [];
    if (foodtype.coverImage) {
        imagesToDelete.push(foodtype.coverImage);
    }
    if (foodtype.images && foodtype.images.length > 0) {
        imagesToDelete.push(foodtype.coverImage);
    }
    if (imagesToDelete.length > 0) {
        yield (0, deleteFiles_utils_1.deleteFiles)(imagesToDelete);
    }
    res.status(201).json({
        success: true,
        status: 'success',
        message: 'food type deleted successfully',
        data: foodtype
    });
}));
