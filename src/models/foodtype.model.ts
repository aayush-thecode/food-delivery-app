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
        minlength: [100, 'description should be atleast 50 character long'],
        trim: true,
    },
    coverImage: {
        public_id:{
            type:String,
            required:true,
        },
        path:{
            type:String,
            required:true,
        },
    },
    images: [
    {
        public_id:{
            type:String,
            required:true,
        },
        path:{
            type:String,
            required:true,
        },
    }],
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


const foodType = mongoose.model('foodtype',foodSchema);

export default foodType; 