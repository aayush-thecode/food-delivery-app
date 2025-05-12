import { Request, Response } from 'express';
import { CustomError } from '../middleware/errorhandeler.middleware';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { compare, hash } from '../utils/bcrypt.utils';
import User from '../models/users.model';

import { generateToken } from '../utils/jwt.utils';
import { getPaginationData } from '../utils/pagination.utils';
import { IPayload } from '../@types/jwt.interfaces';
import { generateResetToken } from '../utils/tokenGenerator';
import { sendEmail } from '../utils/sendemail.utils';
import crypto from 'crypto';


// user registration 
export const register = asyncHandler(async (req: Request, res: Response) => {
        
        const body = req.body;

        const existingUser = await User.findOne({ email: body.email });

        if (existingUser) {
             throw new CustomError('Email already registered', 404);
          }

        if(!body.password) {
            throw new CustomError('Password is required', 404 )
        }
        const hashedPassword = await hash(body.password)

        body.password = hashedPassword

        const user = await User.create(body)

        res.status(201).json ({
            status: 'success',
            success: true,
            message: 'User is registered sucessfully',
            user: user,
        })
})

//get all users

export const getAllData = asyncHandler(async (req: Request, res: Response) => {

    const {page, limit, query, role} = req.query;
  
    const currentPage = parseInt(page as string) || 1;
    const queryLimit = parseInt(limit as string) || 10;
    const skip = (currentPage - 1) * queryLimit;
    
    let filter: Record<string, any> = {};
    
    // Filter by role
    if(role) {
        filter.role = role;
    }
    
    // Text search query
    if(query) {
        filter.$or = [
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phoneNumber: { $regex: query, $options: 'i' } }
        ];
    }
    
    const users = await User.find(filter)
        .select('-password') // Exclude password from results
        .skip(skip)
        .limit(queryLimit)
        .sort({ createdAt: -1 });
    
    const totalCount = await User.countDocuments(filter);
    
    const pagination = getPaginationData(currentPage, queryLimit, totalCount);
    
    res.status(200).json({
        success: true,
        status: "success",
        data: {
            data: users,
            pagination,
        },
        message: "Users fetched successfully",
    });
  });


//update user by id

export const update = asyncHandler(async (req:Request, res: Response) => {

    const id = req.params.id;
    const {firstName, lastName, phoneNumber, gender, addresses} = req.body

    const user = await User.findByIdAndUpdate(id,{
        firstName,
        lastName,
        phoneNumber,
        gender,
        addresses
    }, {new: true })

    if(!user) {
        throw new CustomError('user is required', 404)
    }

    res.status(201).json ({
        status: 'success',
        success: true,
        message: 'user registered success',
        data:user,
    })

})

//Login user 

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    throw new CustomError('Email is required', 400);
  }

  if (!password) {
    throw new CustomError('Password is required', 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError('Invalid credentials', 401);
  }

  const isMatch = await compare(password, user.password as string);

  if (!isMatch) {
    throw new CustomError('Invalid credentials', 401);
  }

  const payload: IPayload = {
    _id: user._id,
    email: user.email as string,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };

  const token = generateToken(payload);

  const { password: _, ...userWithoutPassword } = user.toObject();

  res
    .cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(200)
    .json({
      status: 'success',
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
    });
});


//delete user by id 

export const deleteUserById = asyncHandler( async(req: Request, res:Response) => {

    const deleteId = req.params.id
    
    const deleteUserId = await User.findByIdAndDelete(deleteId)
    
    if(!deleteUserId) {
      
      throw new CustomError('User not found or already deleted', 404);
    
    }
    
    res.status(201).json({
      
      status:'success',
      success:true,
      message: 'user deleted sucessfully',
      data: deleteUserId,
      
      })
    
    }) 

// Forgot Password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError("Email is required", 404);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const { token, hashedToken } = generateResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // valid for 15 minutes
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  await sendEmail({
    to: user.email as string,
    subject: 'Reset your password',
    html: `<p>You requested a password reset.</p>
           <p>Click here: <a href="${resetUrl}">${resetUrl}</a></p>
           <p>This link expires in 15 minutes.</p>`,
  });

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to email',
  });
});

// Reset Password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new CustomError('Password is required', 404);
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }, // Token is still valid
  });

  if (!user) {
    throw new CustomError('Invalid or expired reset token', 404);
  }

  // Hash the new password and save it
  user.password = await hash(password);
  user.resetPasswordToken = undefined; // Clear the reset token after use
  user.resetPasswordExpires = undefined; // Clear the expiration time
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully.',
  });
});
