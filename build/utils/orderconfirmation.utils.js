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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderConfirmationEmail = void 0;
const sendemail_utils_1 = require("./sendemail.utils");
const sendOrderConfirmationEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, orderDetails } = options;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <div style="background: #007bff; padding: 15px; color: white; text-align: center; font-size: 20px; font-weight: bold; border-radius: 8px 8px 0 0;">
      Order Confirmation
    </div>
    <div style="padding: 20px; color: #333;">
      <p>Dear Customer,</p>
      <p>Your order <strong>#${orderDetails.orderId}</strong> has been placed successfully!</p>
      
      <h3 style="margin-top: 20px; font-size: 18px; color: #007bff;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
            <th style="text-align: center; padding: 8px; border-bottom: 2px solid #ddd;">Quantity</th>
            <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetails.items.map((item) => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.food.name}</td>
              <td style="text-align: center; padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
              <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">Rs. ${item.food.price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; padding-top: 10px; border-top: 2px solid #eee;">
        <p style="text-align: right; font-size: 16px; font-weight: bold;">
          Total: <span style="color: #007bff;">Rs. ${orderDetails.totalAmount.toFixed(2)}</span>
        </p>
        <p style="color: #666; font-size: 14px;">
          Order Date: ${new Date(orderDetails.createdAt).toLocaleString()}
        </p>
      </div>
      
      <p style="margin-top: 20px; text-align: center; color: #666;">
        Thank you for purchasing from us! 
      </p>
      <p style="text-align: center; color: #666; font-size: 14px;">
        Best Regards,<br>
        <strong>Your Company</strong>
      </p>
    </div>
</div>
    `;
    const mailOptions = {
        html,
        subject: 'Order Comfirmation! ',
        to,
    };
    yield (0, sendemail_utils_1.sendEmail)(mailOptions);
});
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
