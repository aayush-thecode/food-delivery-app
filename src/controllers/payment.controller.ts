import { Request, Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Payment from '../models/payment.model';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { CustomError } from '../middleware/errorhandeler.middleware';

export const initiateEsewaPayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount, foodId, foodType, returnUrl } = req.body;

  if (!amount || !foodId || !foodType || !returnUrl) {
    throw new CustomError('Missing required fields', 400);
  }

  const transactionUuid = uuidv4();

  const payload = {
    amount,
    total_amount: amount,
    product_delivery_charge: 0,
    product_service_charge: 0,
    tax_amount: 0,
    product_code: foodId,
    transaction_uuid: transactionUuid,
    food_name: foodType,
    success_url: `${returnUrl}?status=success`,
    failure_url: `${returnUrl}?status=failure`,
    merchant_code: process.env.ESEWA_MERCHANT_ID,
  };

  try {
    // Save payment as pending in DB
    await Payment.create({
      amount,
      foodId,
      foodType,
      paymentMethod: 'ESEWA',
      status: 'PENDING',
      transactionUuid,
    });

    const response = await axios.post(process.env.ESEWA_URL!, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    res.status(200).json({
      status: 'success',
      message: 'Esewa payment initiated successfully',
      data: {
        payment_url: response.data.payment_url,
        transactionUuid,
      },
    });
  } catch (error: any) {
    throw new CustomError(`Esewa payment initiation failed: ${error.message}`, 500);
  }
});

export const verifyEsewaPayment = asyncHandler(async (req: Request, res: Response) => {
  const { referenceId, totalAmount, productCode, transactionUuid } = req.body;

  if (!referenceId || !totalAmount || !productCode || !transactionUuid) {
    throw new CustomError('Missing required verification fields', 400);
  }

  const payload = {
    amount: totalAmount,
    reference_id: referenceId,
    product_code: productCode,
    merchant_code: process.env.ESEWA_MERCHANT_ID,
  };

  try {
    const response = await axios.post(process.env.ESEWA_VERIFY_URL!, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.status === 'SUCCESS') {
      // Update payment status in DB
      await Payment.findOneAndUpdate(
        { transactionUuid },
        { status: 'SUCCESS', referenceId }
      );

      res.status(200).json({
        status: 'success',
        message: 'Esewa payment verified successfully',
        data: response.data,
      });
    } else {
      await Payment.findOneAndUpdate(
        { transactionUuid },
        { status: 'FAILED' }
      );

      res.status(400).json({
        status: 'failed',
        message: 'Esewa payment verification failed',
        data: response.data,
      });
    }
  } catch (error: any) {
    throw new CustomError(`Esewa payment verification failed: ${error.message}`, 500);
  }
});
