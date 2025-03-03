import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import { CustomError } from "../middleware/errorhandeler.middleware";
import foodType from "../models/foodtype.model";
import Review from "../models/review.food.model";



// create new review 

export const createFoodReview = asyncHandler(async (req:Request, res: Response) => {

    const body = req.body;

    const { userId, foodTypeId, rating } = body;

    if(!userId || !foodTypeId) {

        throw new CustomError('user Id and Food type Id is required', 400);

    }

    const food = await foodType.findById(foodTypeId);

    if(!foodTypeId) {

        throw new CustomError('food Type not fpund', 404);

    }

    const newReview = await Review.create({...body, foodType: foodTypeId, user:userId})

    foodTypeId.reviews.push(newReview._id)

    const totalRating: number = (food?.averageRating as number * (foodTypeId.reviews.length - 1)) + Number(rating); 

    foodTypeId.averageRating = totalRating / foodTypeId.reviews.length 

    await food?.save() 

    res.status(201).json({
        status: 'success',
        success: true,
        data: newReview,
        message: 'review created successfully!'
    })

})


// getAll  food review data 

export const getAllFoodReview = asyncHandler(async (req: Request, res: Response) => {

    const reviews = await Review.find({})

    res.status(200).json ({ 
        success: true,
        status: 'success',
        data: reviews,
        message: 'review fetched successfully!'

    })
});


//get food reviews by Id 

export const getReviewId = asyncHandler(async (req:Request, res: Response) => {

    const getReviewbyId = req.params.id;

    const getFoodReview = await Review.findById(getReviewId);

    if(!getReviewbyId) {
        
        throw new CustomError('review data not found', 400)

    }

    res.status(200).json ({

        status: 'success',
        success: true,
        message: 'review data fetched successfully!',
        data: getFoodReview

    })
})

//update food review by id 

export const UpdateReview = asyncHandler(async (req:Request, res: Response) => {

    const ReviewId = req.params.id;
    const {rating, review} = req.body;

    const reviews = await Review.findByIdAndUpdate(ReviewId, {
        rating, 
        review
    },{new: true})

    if(!ReviewId) {
        throw new CustomError('review is required', 400)
    }

    res.status(200).json({
        status:'successful',
        success: true,
        message: 'food review updated successfully!',
        data: reviews
    })

})

//delete product by Id

export const deleteFoodReviewById = asyncHandler(async (req:Request, res: Response) => {

    const FoodReviewID = req.params.id;

    const deleteFoodReviewById = await Review.findByIdAndDelete(FoodReviewID);

    if(!deleteFoodReviewById) {
        throw new CustomError('food review not found', 400);
    }

    res.status(200).json ({
        status:'successful',
        success:true,
        message:'food Review deleted successfully',
    })

})