"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const mongoose_1 = require("mongoose");
const cartSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'user',
    },
    fooditems: [{
            food: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'foodtype',
                required: true,
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
}, { timestamps: true });
exports.Cart = (0, mongoose_1.model)('cart', cartSchema);
