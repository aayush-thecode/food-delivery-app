"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const global_types_1 = require("../@types/global.types");
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: [true, 'first name is required'],
        max: [50, 'first name cannot exceed fiftey characters'],
        min: [3, 'first name should be atleast three character']
    },
    lastName: {
        type: String,
        required: [true, 'last name is required'],
        max: [50, 'last name cannot exceed fifty character'],
        min: [3, 'last name should be at least three character']
    },
    email: {
        type: String,
        reauired: [true, 'your email is required'],
        unique: [true, 'user with the provided email id already exist..'],
        match: [emailRegex, 'Please use a valid email']
    },
    role: {
        type: String,
        enum: Object.values(global_types_1.Role),
        default: global_types_1.Role.user
    },
    password: {
        type: String,
        required: true,
        min: [6, 'password must be at least 6 characters']
    },
    gender: {
        type: String,
    },
    phoneNumber: {
        type: String,
        required: true,
        min: [10, 'phone number must be atleast ten digit long']
    },
    addresses: [
        {
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            }
        }
    ],
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    }
}, { timestamps: true });
const User = mongoose_1.default.model('user', userSchema);
exports.default = User;
