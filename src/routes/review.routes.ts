import express, { Router } from 'express'
import { Authenticate } from '../middleware/authentication.middleware';
import { onlyUser } from '../@types/global.types';
import { createFoodReview, deleteFoodReviewById, getAllFoodReview, getReviewId, UpdateReview } from '../controllers/review.food.controller';


const router: Router = express.Router();

//create review
router.post('/', Authenticate(onlyUser), createFoodReview);

// get all reviews
router.get('/', getAllFoodReview);

//update review
router.put('/:id', Authenticate(onlyUser), UpdateReview);

//get user review by foodtype id
router.get('/:id', getReviewId);

//delete review by Id
router.delete('/:id', deleteFoodReviewById)

export default router;
