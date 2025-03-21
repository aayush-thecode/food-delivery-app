import { Request, Response } from "express";
import Category from "../models/category.model";
import { asyncHandler } from "../utils/asyncHandler.utils";
import { CustomError } from "../middleware/errorhandeler.middleware";
import { getPaginationData } from "../utils/pagination.utils";



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


//get all foodType data 

export const getAllCategory = asyncHandler(async (req:Request, res: Response) => {
    const {limit, page, query} = req.query;

    const currentPage = parseInt(page as string) || 1;
    const queryLimit = parseInt(limit as string) || 10;

    const skip = (currentPage - 1) * queryLimit;

    let filter: Record<string, any> = {};

    if(query) {
        filter.$or = [
            {
                name: { $regex: query, $options: 'i'},
            },
            {
                description: { $regex: query, $options: 'i'},
            }
        ];      
    }

    const categories = await Category.find(filter)
    .skip(skip)
    .limit(queryLimit)
    .sort({createdAt: -1});

    const totalCount = await Category.countDocuments(filter);

    const pagination = getPaginationData(currentPage, queryLimit, totalCount);


    res.status(200).json ({
        success:true,
        status:'success',
        data: {
            data: categories,
            pagination,
        },
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