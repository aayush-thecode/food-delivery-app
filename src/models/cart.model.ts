import { Schema, model } from "mongoose";

const cartSchema = new Schema ({
    user:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user',
    },
    fooditems: [{
        food: {
            type: Schema.Types.ObjectId,
            ref: 'foodtype',
            required: true,
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
},{timestamps: true})

export const Cart = model('cart', cartSchema)

