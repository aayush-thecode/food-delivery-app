"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.deleteUserById = exports.login = exports.update = exports.getAllData = exports.register = void 0;
const errorhandeler_middleware_1 = require("../middleware/errorhandeler.middleware");
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const bcrypt_utils_1 = require("../utils/bcrypt.utils");
const users_model_1 = __importDefault(require("../models/users.model"));
const jwt_utils_1 = require("../utils/jwt.utils");
const pagination_utils_1 = require("../utils/pagination.utils");
const tokenGenerator_1 = require("../utils/tokenGenerator");
const sendemail_utils_1 = require("../utils/sendemail.utils");
const crypto_1 = __importDefault(require("crypto"));
// user registration 
exports.register = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const existingUser = yield users_model_1.default.findOne({ email: body.email });
    if (existingUser) {
        throw new errorhandeler_middleware_1.CustomError('Email already registered', 404);
    }
    if (!body.password) {
        throw new errorhandeler_middleware_1.CustomError('Password is required', 404);
    }
    const hashedPassword = yield (0, bcrypt_utils_1.hash)(body.password);
    body.password = hashedPassword;
    const user = yield users_model_1.default.create(body);
    res.status(201).json({
        status: 'success',
        success: true,
        message: 'User is registered sucessfully',
        user: user,
    });
}));
//get all users
exports.getAllData = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, query, role } = req.query;
    const currentPage = parseInt(page) || 1;
    const queryLimit = parseInt(limit) || 10;
    const skip = (currentPage - 1) * queryLimit;
    let filter = {};
    // Filter by role
    if (role) {
        filter.role = role;
    }
    // Text search query
    if (query) {
        filter.$or = [
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phoneNumber: { $regex: query, $options: 'i' } }
        ];
    }
    const users = yield users_model_1.default.find(filter)
        .select('-password') // Exclude password from results
        .skip(skip)
        .limit(queryLimit)
        .sort({ createdAt: -1 });
    const totalCount = yield users_model_1.default.countDocuments(filter);
    const pagination = (0, pagination_utils_1.getPaginationData)(currentPage, queryLimit, totalCount);
    res.status(200).json({
        success: true,
        status: "success",
        data: {
            data: users,
            pagination,
        },
        message: "Users fetched successfully",
    });
}));
//update user by id
exports.update = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { firstName, lastName, phoneNumber, gender, addresses } = req.body;
    const user = yield users_model_1.default.findByIdAndUpdate(id, {
        firstName,
        lastName,
        phoneNumber,
        gender,
        addresses
    }, { new: true });
    if (!user) {
        throw new errorhandeler_middleware_1.CustomError('user is required', 404);
    }
    res.status(201).json({
        status: 'success',
        success: true,
        message: 'user registered success',
        data: user,
    });
}));
//Login user 
exports.login = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email) {
        throw new errorhandeler_middleware_1.CustomError('Email is required', 400);
    }
    if (!password) {
        throw new errorhandeler_middleware_1.CustomError('Password is required', 400);
    }
    const user = yield users_model_1.default.findOne({ email });
    if (!user) {
        throw new errorhandeler_middleware_1.CustomError('Invalid credentials', 401);
    }
    const isMatch = yield (0, bcrypt_utils_1.compare)(password, user.password);
    if (!isMatch) {
        throw new errorhandeler_middleware_1.CustomError('Invalid credentials', 401);
    }
    const payload = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    };
    const token = (0, jwt_utils_1.generateToken)(payload);
    // const { password: _, ...userWithoutPassword } = user.toObject();
    res.cookie('access_token', token, {
        // httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // 'none' for prod, 'lax' for localhost
        // maxAge: 24 * 60 * 60 * 1000,  // 1 day expiration
    })
        .status(200)
        .json({
        status: 'success',
        success: true,
        message: 'Login successful',
        user, token,
    });
}));
//delete user by id 
exports.deleteUserById = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteId = req.params.id;
    const deleteUserId = yield users_model_1.default.findByIdAndDelete(deleteId);
    if (!deleteUserId) {
        throw new errorhandeler_middleware_1.CustomError('User not found or already deleted', 404);
    }
    res.status(201).json({
        status: 'success',
        success: true,
        message: 'user deleted sucessfully',
        data: deleteUserId,
    });
}));
// Forgot Password
exports.forgotPassword = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        throw new errorhandeler_middleware_1.CustomError("Email is required", 404);
    }
    const user = yield users_model_1.default.findOne({ email });
    if (!user) {
        throw new errorhandeler_middleware_1.CustomError("User not found", 404);
    }
    const { token, hashedToken } = (0, tokenGenerator_1.generateResetToken)();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // valid for 15 minutes
    yield user.save();
    const resetUrl = `${process.env.FRONTEND_URL || 'https://food-delivery-client-qv92.vercel.app'}/reset-password/${token}`;
    yield (0, sendemail_utils_1.sendEmail)({
        to: user.email,
        subject: 'Reset your password',
        html: `<p>You requested a password reset.</p>
           <p>Click here: <a href="${resetUrl}">${resetUrl}</a></p>
           <p>This link expires in 15 minutes.</p>`,
    });
    res.status(200).json({
        success: true,
        message: 'Password reset link sent to email',
    });
}));
// Reset Password
exports.resetPassword = (0, asyncHandler_utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) {
        throw new errorhandeler_middleware_1.CustomError('Password is required', 404);
    }
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const user = yield users_model_1.default.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() }, // Token is still valid
    });
    if (!user) {
        throw new errorhandeler_middleware_1.CustomError('Invalid or expired reset token', 404);
    }
    // Hash the new password and save it
    user.password = yield (0, bcrypt_utils_1.hash)(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    yield user.save();
    res.status(200).json({
        success: true,
        message: 'Password has been reset successfully.',
    });
}));
