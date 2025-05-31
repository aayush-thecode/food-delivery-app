import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import { CustomError } from "../middleware/errorhandeler.middleware";
import foodType from "../models/foodtype.model";
import Review from "../models/review.food.model";
import { getPaginationData } from "../utils/pagination.utils";



// create new food review 

export const createFoodReview = asyncHandler(async (req:Request, res: Response) => {

    const body = req.body;

    const { userId, foodTypeId, rating } = body;

    if(!userId || !foodTypeId) {

        throw new CustomError('user Id and Food type Id is required', 400);

    }

    const food = await foodType.findById(foodTypeId);

    if(!food) {

        throw new CustomError('food Type not fpund', 404);

    }

    const newReview = await Review.create({...body, foodType: foodTypeId, user:userId})

    food.reviews.push(newReview._id)

    const totalRating: number = (food?.averageRating as number * (foodTypeId.reviews.length + 1)) + Number(rating); 

    foodTypeId.averageRating = totalRating / foodTypeId.reviews.length 

    await food.save(); 

    res.status(201).json({
        status: 'success',
        success: true,
        data: newReview,
        message: 'review created successfully!'
    })

})


// getAll food review data 

export const getAllFoodReview = asyncHandler(async (req: Request, res: Response) => {

    const {rating, page, limit, query, foodType} = req.query;

    const currentPage = parseInt(page as string) || 1;
    const queryLimit = parseInt(limit as string) || 10;
    const skip = (currentPage - 1) * queryLimit;

    let filter: Record<string, any> = {};

    if(rating) {
        filter.rating = parseInt(rating as string);
    }

    if(foodType) {
        filter.foodType = foodType;
    }

    if(query) {
        filter.$or = [
            {
                review: { $regex: query, $options: 'i'},
            }
        ];
    }

    const reviews = await Review.find(filter)
    .skip(skip)
    .limit(queryLimit)
    .sort({ createdAt: -1 })
    .populate('fooditems.foodtype')
    .populate('user');

    const totalCount = await Review.countDocuments(filter);

    const pagination = getPaginationData(currentPage, queryLimit, totalCount);


    res.status(200).json ({
        success:true,
        status:'success',
        data: {
            data: reviews,
            pagination,
        },
        message: 'review fetched successfully!'
    })
});


//get reviews by food type Id 

export const getReviewId = asyncHandler(async (req:Request, res: Response) => {

    const {foodId} = req.params;


    if(!foodId) {
        
        throw new CustomError('review data not found', 400)

    }

    const food = await Review.findById(foodId) 

    if(!food) {

        throw new CustomError('food not found', 404);

    }

    // find reviews for the given foodId 

    const reviews = await Review.find({food: foodId})

    res.status(200).json ({

        status: 'success',
        success: true,
        message: 'review data fetched successfully!',
        data: reviews,

    })
})


//update review by food id 

export const UpdateReview = asyncHandler(async (req:Request, res: Response) => {

    const {rating, ReviewId, foodId, comment} = req.body;

    if(!ReviewId || !foodId) {
        
        throw new CustomError('product Id and food Id is required', 400)

    }

    const food = await foodType.findById(foodId);

    if(!food) {
        
        throw new CustomError('Food not found', 404); 

    }

    const review = await Review.findById(ReviewId)

    if(!review) {

        throw new CustomError('Review not found', 404);

    }

    //store the old rating before updating new review 

    const oldRating = review.rating;

    //update review feilds

    if(rating !== undefined) review.rating = rating;

    if(comment !== undefined) review.review = comment;

    await review.save();

    //update the average rating 

    const totalRating = (food?.averageRating as number * food.reviews.length - oldRating + rating) / food.reviews.length 

    food.averageRating = totalRating

    await food.save();

    res.status(200).json ({ 
        status: 'success',
        success: true,
        data: review,
        message: 'review updated successfully'
    })

});


//delete review by foodId

export const deleteFoodReviewById = asyncHandler(async (req:Request, res: Response) => {

    const { userId, foodId} = req.body;

 

    if(!userId || !foodId) {
       
        throw new CustomError('food Id and user Id are required', 400);

    }

    const food = await foodType.findById(foodId);

    if(!food) {

        throw new CustomError('food not found', 404);

    }

    const review = await Review.findOne({food: foodId, user: userId});

    if(!review) {

        throw new CustomError("review not found", 404)

    }

    await Review.findByIdAndDelete(review._id);

    food.reviews.pull(food.reviews.filter((id) => id.toString() !== review._id.toString()))

    // recalculate average rating
    
    if (food.reviews.length === 0) {

        food.averageRating = 0;

    } else {

        const totalRating = (food.averageRating as number * (food.reviews.length + 1)) - review.rating;

        food.averageRating = totalRating / food.reviews.length; 
        
    }

    await food.save();

    res.status(200).json ({
        status:'successful',
        success:true,
        message:'food Review deleted successfully',
    })

})