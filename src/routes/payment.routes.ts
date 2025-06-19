import express from 'express'
import { initiateEsewaPayment, verifyEsewaPayment } from '../controllers/payment.controller';

const router = express.Router();

router.post('/esewa/initiate', initiateEsewaPayment);
router.post('/esewa/verify', verifyEsewaPayment);

export default router;