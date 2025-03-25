import mongoose from "mongoose";

const foodSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: [true, 'food name is required!'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'price is required'],
        min: [0, 'price should be greater than 0']
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: [true, 'author is required!'],
    }, 
    description: {
        type: String,
        required: false,
        min: [50, 'description should be atleast 50 character long'],
        trim: true,
    },
    coverImage: {
        type: String,
        required: false,
    },
    images: [
        {
            type: String,
            required: false
        }
    ],
    category:{
        type:mongoose.Types.ObjectId,
        ref:'category',
        required:[true, 'Category is required']
    },
    reviews: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'review',
            required: false
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    }
}, {timestamps: true})


const foodType = mongoose.model('foodType',foodSchema);

export default foodType; 