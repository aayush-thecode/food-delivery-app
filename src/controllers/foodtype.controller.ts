import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import foodType from "../models/foodtype.model";
import { CustomError } from "../middleware/errorhandeler.middleware";
import { deleteFiles } from "../utils/deleteFiles.utils";
import Category from "../models/category.model";

//create food type 

export const create = asyncHandler(async (req: Request, res: Response) => {

    const body = req.body;

    const foodProduct = await foodType.create(body);

    const {coverImage, images} = req.files as {
        [feildname: string]: Express.Multer.File[];
    }

    if(!coverImage) {
        throw new CustomError('cover image is required', 400);
    }

    foodProduct.coverImage = coverImage[0]?.path

    if(images && images.length > 0) {
        const imagePath: string[] = images.map(
            (image: any, index: number) => image.path
        );
        foodProduct.images = imagePath;
    }

    await foodProduct.save();

    res.status(201).json({
        status:'success',
        success:true,
        data: foodProduct,
        message: 'foodType created successfully!'
    })

})

// get all food type 

export const getAll = asyncHandler(async (req: Request, res: Response) => {

    const foodtype = await foodType.find({}).populate('createdBy')

    res.status(200).json ({
        success:true,
        status:'success',
        data: foodtype,
        message: 'foodType fetched successfully!'
    })
})

// get food type by id

export const getFoodById = asyncHandler(async (req: Request, res: Response) => {

    const foodId = req.params.id;

    const foodTypeId = await foodType.findById(foodId).populate("createdBy")

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

    const{deletedImages, name, description, price, categoryId} = req.body;

    const foodId = req.params.id;

    const {coverImage, images} = req.files as {
        [fieldname: string]: Express.Multer.File[];
    };

    const foodtype = await foodType.findByIdAndUpdate(foodId, 
        {name, description, price},
        {new: true}
    )

    if(!foodtype) {

        throw new CustomError('Food not found', 400)

    }

    if(categoryId) {

        const category = await Category.findById(categoryId);
        
        if(!category) {
            throw new CustomError('category not found', 404)
        }
        foodtype.category = categoryId;
    }
    if(coverImage) {
        await deleteFiles([foodtype.coverImage as string]);
        foodtype.coverImage = coverImage[0]?.path;
    }

    if (deletedImages && deletedImages.length > 0 ) {
        await deleteFiles(deletedImages as string[]);
        foodtype.images = foodtype.images.filter(
            (image) => !deletedImages.include(image)
        );
    }

    if(images && images.length > 0) {
        const imagePath: String[] = images.map(
            (image:any, index:Number) => image.path
        );
        foodtype.images = [...foodtype.images, ...imagePath]
    }

    await foodtype.save();

    res.status(201).json({

        status: 'success',
        success: true,
        message: 'food type updated successfully!',
        data: foodtype

    })
})

//delete food type by id 

export const remove = asyncHandler(async (req: Request, res: Response) => {

    const foodId = req.params.id;

    const foodtype = await foodType.findById(foodId);

    if(!foodtype) {

        throw new CustomError('food delete failed', 400)

    }

    if(foodtype.images && foodtype.images.length > 0) {
        await deleteFiles(foodtype.images as string[]);
    }

    await foodType.findByIdAndDelete(foodtype._id);

    res.status(201).json({
        success: true,
        status: 'success',
        message: 'food type deleted successfully',
        data: foodtype
    })
})