import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import { CustomError } from "../middleware/errorhandeler.middleware";
import { Cart } from "../models/cart.model";
import foodType from "../models/foodtype.model";


//create

export const create = asyncHandler(async (req: Request, res: Response) => {

    const { quantity, foodId } = req.body;

    const userId = req.user._id;

    let cart 

    if(!userId) {
        throw new CustomError('userId is required', 404)
    }

    if(!foodId) {
        throw new CustomError('foodId is required', 404)
    }

    cart = await Cart.findOne({user: userId});

    if(!cart) {
        cart = new Cart ({user:userId, items: []})
    }

    const foodtype = await foodType.findById(foodId)

    if(!foodtype) {
        throw new CustomError('food not found', 404)
    }

    const existingfood = cart.fooditems.find((item) => item.food.toString() === foodId)

    console.log("🚀 ~ create ~ existingfood:", existingfood)

    if(existingfood) {
        existingfood.quantity += Number(quantity)
    } else {
        cart.fooditems.push({food: foodId, quantity})
    }

    await cart.save()

    res.status(201).json({
        status: 'success',
        success: true,
        message: 'Food added to cart',
        data: cart
    })
})

// get cart by userId 

export const getCartByUserId = asyncHandler(async(req:Request, res: Response) => {

    const userId = req.params.id;

    const cart = await Cart.findOne({user: userId})
    .populate('user', '-password')
    .populate('items.food')

    res.status(200).json({
        status:'success',
        success: true,
        message: 'cart fetched successfully!',
        data: cart 
    })
})

//clear cart 

export const clearCart = asyncHandler(async(req: Request, res: Response) => {

    const foodId = req.params.foodId

    if(!foodId) {
        throw new CustomError('food not found', 404)
    }

    const userId = req.params._id
 
    const cart = await Cart.findOne({user: userId})

    if(!cart) {
        throw new CustomError('cart is not created', 400)
    }

    await Cart.findOneAndDelete({user: userId})

    res.status(200).json ({
        success: true,
        status:'success',
        message: 'foodItem removed from cart',
        data: null
    })
})