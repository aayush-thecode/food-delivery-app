"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_middleware_1 = require("../middleware/authentication.middleware");
const global_types_1 = require("../@types/global.types");
const review_food_controller_1 = require("../controllers/review.food.controller");
const router = express_1.default.Router();
//create review
router.post('/', (0, authentication_middleware_1.Authenticate)(global_types_1.onlyUser), review_food_controller_1.createFoodReview);
// get all reviews
router.get('/', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyAdmin), review_food_controller_1.getAllFoodReview);
//update review
router.put('/:id', (0, authentication_middleware_1.Authenticate)(global_types_1.onlyUser), review_food_controller_1.UpdateReview);
//get user review by foodtype id
router.get('/:id', (0, authentication_middleware_1.Authenticate)(global_types_1.OnlyAdmin), review_food_controller_1.getReviewId);
//delete review by Id
router.delete('/:id', review_food_controller_1.deleteFoodReviewById);
exports.default = router;
