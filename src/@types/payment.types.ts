import mongoose from "mongoose";

// Payment status enum
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

// Payment method enum
export enum PaymentMethod {
  ESEWA = 'ESEWA',
  COD = 'COD',
  CARD = 'CARD',
}

// Payment interface to use throughout your code
export interface IPayment {
  _id?: mongoose.Types.ObjectId;
  amount: number;
  foodId: string;
  foodType: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionUuid: string;
  referenceId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
