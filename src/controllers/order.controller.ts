import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import { Cart } from "../models/cart.model";
import { CustomError } from "../middleware/errorhandeler.middleware";
import foodType from "../models/foodtype.model";
import Order from "../models/order.model";
import { sendOrderConfirmationEmail } from "../utils/orderconfirmation.utils";
import { getPaginationData } from "../utils/pagination.utils";


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
    });

    const newOrder = await order.save();
    const populatedOrder = await Order.findById(newOrder._id)
    .populate("fooditems.foodtype")

    if(!populatedOrder) {
        throw new CustomError('order not created', 404);
    }

    await sendOrderConfirmationEmail({
        to: req.user.semail,
        orderDetails: populatedOrder
    });

    await Cart.findByIdAndDelete(cart._id)

    res.status(201).json({
        status:'success',
        success: true,
        message: 'order placed successfully',
        data: populatedOrder
    })
});


//get all orders 

export const getAllOrder = asyncHandler(async(req: Request, res: Response) => {

    const {page, limit, status, user, minAmount, maxAmount, startDate, endDate, query} = req.query;

    const currentPage = parseInt(page as string) || 1;
    const queryLimit = parseInt(limit as string) || 10;
    const skip = (currentPage - 1) * queryLimit;

    let filter: Record<string, any> = {}

    if(status) {
        filter.status = status;
    }

    if(user) {
        filter.user = user;
    }

    if(query) {
        filter.orderId = [
            {
                orderId: { regex: query, $options: 'i'}
            }
        ]
    }

    if(minAmount && maxAmount) {
        filter.totalAmount = {
            $gte: parseFloat(minAmount as string),
            $lte: parseFloat(maxAmount as string)
        };
    } else if(minAmount) {
        filter.totalAmount = { $gte: parseFloat(minAmount as string)};
    } else if(maxAmount) {
        filter.totalAmount = { $lte: parseFloat(maxAmount as string)};
    }

    //filter by date range

    if(startDate && endDate) {
        filter.createdAt = {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string)
        };
    } else if(startDate) {
        filter.createdAt = { $gte: new Date(startDate as string) };
    } else if(endDate) {
        filter.createdAt = { $lte: new Date(endDate as string) };
    }

    const orders = await Order.find(filter)
    .skip(skip)
    .limit(queryLimit)
    .sort({ createdAt: -1 })
    .populate('fooditems.foodtype')
    .populate('user','-password');

    const totalCount = await Order.countDocuments(filter);

    const pagination = getPaginationData(currentPage, queryLimit, totalCount);

    res.status(200).json({
        success: true,
        status: 'success',
        data: {
            data: orders,
            pagination,
        },
        message: 'Orders fetched successfully!'
    });
});

//get orders by user id

export const getUSerId = asyncHandler(async(req: Request, res: Response)=> {
    const userId = req.user._id

    const orders = Order.findOne({user:userId})
    .populate("fooditems.foodtype")
    .populate("user", "-password")

    res.status(201).json({
        status: 'success',
        success: true,
        message: 'order fetched successfully!',
        data: orders
    })
});


//update

export const updateOrderStatus = asyncHandler(async(req:Request, res:Response) => {

    const orderId = req.params.id;

    const {status} = req.body;

    if(!status) {
        throw new CustomError('status is required', 404)
    }

    if(!orderId) {
        throw new CustomError('orderId is required', 400)
    }

    const updatedOrder = Order.findByIdAndUpdate(orderId,
         {status}, 
         {new: true})

    if(!updatedOrder) {
        throw new CustomError('order not found', 404)
    }

    res.status(201).json({
        success:true,
        status: 'success',
        message: 'order status updated successfully',
        data: updatedOrder,
    })
})


//delete order 

export const deleteOrder = asyncHandler(async(req:Request, res:Response) => {

    const orderId = req.params.id;

    if(!orderId) {
        throw new CustomError('orderId is required', 400)
    }

    const deletedOrder = Order.findByIdAndDelete(orderId)

    if(!deletedOrder) {
        throw new CustomError('order not found', 404)
    }

    res.status(201).json({
        success:true,
        status: 'success',
        message: 'order deleted successfully',
        data: deletedOrder,
    })
})


// cancel Order
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {

    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
        throw new CustomError('Order not found', 404);
    }

    if (order.user.toString() !== userId.toString()) {
        throw new CustomError('Unauthorized access to this order', 403);
    }

    if (['delivered', 'shipped', 'cancelled'].includes(order.status)) {
        throw new CustomError(`Order cannot be canceled when in ${order.status} status`, 400);
    }

    // Cancel the entire order
    order.status = 'cancelled';
    order.cancelledAt = new Date();

    await order.save();

    res.status(200).json({
        success: true,
        status: 'success',
        message: 'Order cancelled successfully!',
        data: order
    });
});
