import { Request, Response } from "express";
import Category from "../models/category.model";
import { asyncHandler } from "../utils/asyncHandler.utils";
import { CustomError } from "../middleware/errorhandeler.middleware";



//create 
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


// update product data 

export const UpdateProduct = asyncHandler( async (req:Request, res:Response) => {

    const productId = req.params.id;
    const {name, price, createdBy, description} = req.body;

    const category = await Category.findByIdAndUpdate(productId, {
        name, 
        price,
        createdBy,
        description,
    },{new:true})
    
    if(!Category){
    throw new CustomError('category is required', 400)
    }
    res.status(201).json ({
    status: 'success',
    success: true,
    message: 'category Updated successfully',
    data: category

    })
})

//delete productby Id 

export const deleteCategoryById = asyncHandler (async(req: Request, res: Response) => {

    const CategoryId = req.params.id;

    const deleteCategoryById = await Category.findByIdAndDelete(CategoryId);

    if (!Category) {
        throw new CustomError('product not found', 404)
    }

    res.status(200).json ({
        status: 'success',
        success: true,
        message: 'Product deleted successfully!',
        data: deleteCategoryById,
    })
})
