import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import foodType from "../models/foodtype.model";
import { CustomError } from "../middleware/errorhandeler.middleware";

//create food type 

export const create = asyncHandler(async (req: Request, res: Response) => {

    const body = req.body;

    const foodProduct = await foodType.create(body)

    res.status(201).json({
        status:'success',
        success:true,
        data: foodProduct,
        message: 'foodType created successfully!'
    })

})

// getall food type 

export const getAll = asyncHandler(async (req: Request, res: Response) => {

    const foodProduct = await foodType.find({})

    res.status(200).json ({
        success:true,
        status:'success',
        data: foodProduct,
        message: 'foodType fetched successfully!'
    })
})

// get food type by id

export const getFoodById = asyncHandler(async (req: Request, res: Response) => {

    const foodId = req.params.id;

    const foodTypeId = await foodType.findById(foodId)

    if(!foodId) {

        throw new CustomError('food type not found please type correct food type', 400)
    }
        res.status(200).json ({
            status:'success',
            success:true,
            message: 'food fetched successfully',
            data: foodTypeId
        })
})

//update food type by Id 

export const updateFood = asyncHandler(async (req: Request, res: Response) => {

    const foodId = req.params.id;

    const foodTypeId = await foodType.findByIdAndUpdate(foodId)

    if(!foodId) {

        throw new CustomError('food update unsuccessfull wrong foodtypeId', 400)

    }

    res.status(200).json({

        status: 'success',
        success: true,
        message: 'food type updated successfully!',
        data: foodTypeId

    })
})

//delete food type by id 

export const deleteFood = asyncHandler(async (req: Request, res: Response) => {

    const foodId = req.params.id;

    const deleteFood = await foodType.findByIdAndDelete(foodId)

    if(!foodId) {

        throw new CustomError('food delete failed', 400)

    }

    res.status(200).json({
        success: true,
        status: 'success',
        message: 'food type deleted successfully',
        data: deleteFood
    })

})