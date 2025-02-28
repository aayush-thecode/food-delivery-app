import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import Product from "../models/product.model";

//create
export const create = asyncHandler(async (req: Request, res: Response) => {

    const body = req.body;

    const product = await Product.create(body)

    res.status(201).json({
        status:'success',
        success:true,
        data: product,
        message: 'product created successfully!'
    })

})

// getall product data 
export const getAll = asyncHandler(async (req: Request, res: Response) => {
    const products = await Product.find({}).populate('createdBy')

    res.status(200).json ({
        success:true,
        status:'success',
        data: products,
        message: 'Product fetched successfully!'
    })
})