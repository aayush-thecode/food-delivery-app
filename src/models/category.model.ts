import mongoose from "mongoose"

const categorySchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
    }
},{timestamps: true})


const Category = mongoose.model('category', categorySchema)
export default Category;