import { Request, Response } from "express";
import Category from "../models/category.model";
import { asyncHandler } from "../utils/asyncHandler.utils";
import { CustomError } from "../middleware/errorhandeler.middleware";



//create category 
export const create = asyncHandler(async (req: Request, res: Response) => {

    const body = req.body;


    const category = await Category.create(body)

    res.status(201).json ({
        status:'success',
        success: true,
        data: category,
        message: 'Category created successfully!'
    })
})


//get all product data 

export const getAllCategory = asyncHandler(async (req:Request, res: Response) => {
    const categories = await Category.find({}).populate('createdBy')

    res.status(200).json ({
        success: true,
        status: 'success',
        data: categories,
        message: 'category fetched successfully!'
    })
})


//update category by product id

export const UpdateProduct = asyncHandler(async (req: Request, res: Response) => {

    const foodId = req.params.id; 

    if(!foodId) {
        throw new CustomError('category is required', 400)
    }

    const {name, description} = req.body; 

    const category = await Category.findByIdAndUpdate(foodId, {
        name,
        description
    }, {new:true})

if(!Category) {
    throw new CustomError('category not found', 400)
}

    res.status(201).json ({
    status: 'success',
    success: true,
    message: 'category Updated successfully',
    data: category

    })

})


//delete categoryby Id 

export const deleteCategoryById = asyncHandler (async(req: Request, res: Response) => {

    const CategoryId = req.params.id;

    if(!CategoryId) {

        throw new CustomError(' Id is required', 404)

    }

    const deleteCategoryById = await Category.findByIdAndDelete(CategoryId);

    if (!deleteCategoryById) {

        throw new CustomError('Food not found', 404)

    }

    res.status(200).json ({
        status: 'success',
        success: true,
        message: 'Product deleted successfully!',
        data: deleteCategoryById,
    })
})