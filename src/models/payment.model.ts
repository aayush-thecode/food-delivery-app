import mongoose from "mongoose";
import { PaymentStatus, PaymentMethod } from "../@types/payment.types";

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  foodId: {
    type: String,
    required: [true, 'Food ID is required'],
  },
  foodType: {
    type: String,
    required: [true, 'Food type is required'],
    maxlength: [100, 'Food type cannot exceed 100 characters'],
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    default: PaymentMethod.ESEWA,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  },
  transactionUuid: {
    type: String,
    required: [true, 'Transaction UUID is required'],
    unique: true,
  },
  referenceId: {
    type: String,
  },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
