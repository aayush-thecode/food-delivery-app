import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import { CustomError } from "../middleware/errorhandeler.middleware";
import foodType from "../models/foodtype.model";
import Review from "../models/review.food.model";
import { getPaginationData } from "../utils/pagination.utils";



// create new food review 

export const createFoodReview = asyncHandler(async (req:Request, res: Response) => {

    const body = req.body;
    const user = req.user;
    const { foodId, rating } = body;

    if(!foodId) {

        throw new CustomError('Food Id is required', 400);

    }

    const food = await foodType.findById(foodId);

    if(!food) {

        throw new CustomError('food Type not found', 404);

    }

    const newReview = await Review.create({...body, food: foodId, user:user._id});

    food.reviews.push(newReview._id)

    const totalRating: number = (food?.averageRating as number * (food.reviews.length - 1)) + Number(rating); 

    food.averageRating = totalRating / food.reviews.length 

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

    const {food, page, limit, } = req.query;
    let filter: Record<string, any> = {};
	const perPage = parseInt(limit as string) || 10;
	const currentPage = parseInt(page as string) || 1;
	const skip = (currentPage - 1) * perPage;

    if(food) {
        filter.food = food;
    }

    const reviews = await Review.find(filter)
        .skip(skip)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .populate("user", "firstName lastName email _id")
        .populate("food", "name _id");

    const totalCount = await Review.countDocuments(filter);

    res.status(200).json({
        success: true,
        status: "success",
        data: {
            data: reviews,
            pagination: getPaginationData(currentPage, perPage, totalCount),
        },
        message: "Reviews fetched successfully!",
    })
});


//get reviews by food type Id 

export const getReviewId = asyncHandler(async (req:Request, res: Response) => {

    const foodId = req.params.foodId;
    const reviews = await Review.find({ food: foodId}).populate("user");

    res.status(200).json ({

        status: 'success',
        success: true,
        message: 'review data fetched successfully!',
        data: reviews,
    })
})


//update review by food id 

export const UpdateReview = asyncHandler(async (req:Request, res: Response) => {

    const {rating, reviewId, foodId, comment} = req.body;

    
    
    if(!reviewId || !foodId) {
        
        throw new CustomError('product Id and food Id is required', 400)
        
    }
    
    const food = await foodType.findById(foodId);
    
    if(!food) {
        
        throw new CustomError('Food not found', 404); 
        
    }
    
    const review = await Review.findById(reviewId)
    
    if(!review) {
        
        throw new CustomError('Review not found', 404);
        
    }
    
    if (review.user.toString() !== req.user._id.toString()) {
        throw new CustomError("Not authorized to modify this review", 403);
    }

    //store the old rating before updating new review 

    const oldRating = review.rating;

    //update review feilds

    if (rating !== undefined) {
        const totalRating = ((food.averageRating as number * food.reviews.length) - oldRating + rating) / food.reviews.length;

        food.averageRating = totalRating;

        await food.save();
    }

    if(comment !== undefined) review.review = comment;

    await review.save();

    //update the average rating 

    const totalRating = ((food.averageRating as number * food.reviews.length) - oldRating + rating) / food.reviews.length;


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

    if (review.user.toString() !== req.user._id.toString()) {

        throw new CustomError("Not authorized to modify this review", 403);
        
    }

    food.reviews.pull(review._id);

    const remainingReviews = food.reviews.length;

    // recalculate average rating
    
    if (remainingReviews === 0) {

    food.averageRating = 0;

    } else {

    const totalRating = (food.averageRating as number * (remainingReviews + 1)) - review.rating;
    
    food.averageRating = totalRating / remainingReviews;
}

    await food.save();

    res.status(200).json ({
        status:'successful',
        success:true,
        message:'food Review deleted successfully',
    })

})