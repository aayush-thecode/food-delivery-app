import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import { Cart } from "../models/cart.model";
import { CustomError } from "../middleware/errorhandeler.middleware";
import foodType from "../models/foodtype.model";
import Order from "../models/order.model";


// place food order

export const placeOrder = asyncHandler(async(req: Request, res: Response) => {

    const userId = req.user._id;

    const cart = await Cart.findOne({user: userId})
    .populate('fooditems.foodtype')

    if(!cart) {
        throw new CustomError("cart not found", 404);
    }

    const foods = await Promise.all(cart.fooditems.map(async(item) => {

        const foods = await foodType.findById(item.food)

        if(!foods) {
            throw new CustomError('Food type not found',404)
        }

        return {
            foods: item.food._id,
            quantity: item.quantity,
            totalPrice: Number(foods.price) * item.quantity
        }
    }))

    const totalAmount = foods.reduce((acc, item) => + item.totalPrice, 0) 

    const order = new Order ({
        user: userId,
        items: foods,
        totalAmount
    })
});

const new