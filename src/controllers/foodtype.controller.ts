import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import foodType from "../models/foodtype.model";
import { CustomError } from "../middleware/errorhandeler.middleware";
import { deleteFiles } from "../utils/deleteFiles.utils";
import Category from "../models/category.model";
import { getPaginationData } from "../utils/pagination.utils";


//create food type 

export const create = asyncHandler(async (req: Request, res: Response) => {

    const { name, price, description, category: categoryId} = req.body;
	const admin = req.user;
	const files = req.files as {
		coverImage?: Express.Multer.File[];
		images?: Express.Multer.File[];
	};

	if (!files || !files.coverImage) {
		throw new CustomError("Cover image is required", 400);
	}
	const coverImage = files.coverImage;
	const images = files.images;

    
	// get category
	const category = await Category.findById(categoryId);

	if (!category) {
		throw new CustomError(" Food Category not found", 404);
	}

	const food = new foodType({
		name,
		price,
		description,
		createdBy: admin._id,
		category: category._id,
	});

	food.coverImage = {
        path:coverImage[0].path,
        public_id:coverImage[0].filename
    };


	if (images && images.length > 0) {
		const imagePath = images.map(
			(image: any, index: number) => {
                return {
                    path:image.path,
                    public_id:image.filename
                }
            }
		);
		food.images = [...food.images,...imagePath];
	}

	await food.save();

	res.status(201).json({
		status: "success",
		success: true,
		data: food,
		message: "Food type created successfully!",
	});
});

// get all food type 

export const getAll = asyncHandler(async (req: Request, res: Response) => {

    const {
		limit,
		page,
		query,
		category,
		minPrice,
		maxPrice,
		sortBy = "createdAt",
		order = "DESC",
	} = req.query;

	const queryLimit = parseInt(limit as string) || 10;
	const currentPage = parseInt(page as string) || 1;
	const skip = (currentPage - 1) * queryLimit;

	let filter: Record<string, any> = {};

	if (category) {
		filter.category = category;
	}

	if (minPrice && maxPrice) {
		filter.price = {
			$lte: parseFloat(maxPrice as string),
			$gte: parseFloat(minPrice as string),
		};
	}

	if (query) {
		filter.$or = [
			{
				name: { $regex: query, $options: "i" },
			},
			{
				description: { $regex: query, $options: "i" },
			},
		];
	}

	const foods = await foodType.find(filter)
		.skip(skip)
		.limit(queryLimit)
		.populate("createdBy", '-password')
		.populate("category")
		.sort({ [sortBy as string]: order === "DESC" ? -1 : 1 });

	const totalCount = await foodType.countDocuments(filter);

	const pagination = getPaginationData(currentPage, queryLimit, totalCount);

	res.status(200).json({
		success: true,
		status: "success",
		data: {
			data: foods,
			pagination,
		},
		message: "foods fetched successfully!",
	});
});

// get food type by id

export const getFoodById = asyncHandler(async (req: Request, res: Response) => {

    const foodId = req.params.id;

    const foodTypeId = await foodType.findById(foodId).populate("createdBy")

    if(!foodId) {

        throw new CustomError('food type not found please type correct food type', 404)
    }
        res.status(201).json ({
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
        foodtype.coverImage = {
            path:coverImage[0].path,
            public_id:coverImage[0].filename
        }
    }

    if (deletedImages && deletedImages.length > 0 ) {
        await deleteFiles(deletedImages as string[]);
        foodtype.images = foodtype.images.filter(
            (image) => !deletedImages.includes(image.public_id)
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

    const foodtype = await foodType.findByIdAndDelete(foodId);

    if(!foodtype) {

        throw new CustomError('food type not found', 404);

    }

    if(foodtype.coverImage) {
        // @ts-expect-error 
        await deleteFiles([product.coverImage?.public_id] as string[])
    }

    //delete assosiated images if they exist

    const imagesToDelete: string[] = [];

    if(foodtype.coverImage) {
        imagesToDelete.push(foodtype.coverImage as string);
    }

    if(foodtype.images && foodtype.images.length > 0) {
        imagesToDelete.push(foodtype.coverImage as string);
    }

    if (imagesToDelete.length > 0) {
        await deleteFiles(imagesToDelete);
    }


    res.status(201).json({
        success: true,
        status: 'success',
        message: 'food type deleted successfully',
        data: foodtype
    })
})