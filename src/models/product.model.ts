import mongoose from "mongoose";

const productSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: [true, 'product name is required!'],
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
    }
}, {timestamps: true})

const Product = mongoose.model('Product',productSchema);
export default Product; 