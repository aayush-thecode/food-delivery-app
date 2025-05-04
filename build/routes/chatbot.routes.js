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
const express_1 = require("express");
const together_ai_1 = require("together-ai");
const errorhandeler_middleware_1 = require("../middleware/errorhandeler.middleware");
const router = (0, express_1.Router)();
// Initialize Together API
const together = new together_ai_1.Together({
    apiKey: process.env.TOGETHER_AI_API_KEY,
});
// Helper function to fetch chat responses
function getChatResponse(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const response = yield together.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            });
            (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        }
        catch (error) {
            console.error("Error fetching response:", error);
            return undefined;
        }
    });
}
// Chatbot route
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        if (!message) {
            throw new errorhandeler_middleware_1.CustomError('Message is required', 400);
        }
        const chatResponse = yield getChatResponse(message);
        if (chatResponse) {
            res.json({ response: chatResponse });
        }
        else {
            throw new errorhandeler_middleware_1.CustomError('Failed to get a response from the AI model', 500);
        }
    }
    catch (error) {
        next(error);
    }
}));
// Handle undefined routes
router.all('*', (req, res, next) => {
    const message = `Cannot ${req.method} on ${req.originalUrl}`;
    next(new errorhandeler_middleware_1.CustomError(message, 404));
});
// Global error handler
router.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong!';
    const status = error.status || 'error';
    res.status(statusCode).json({
        status,
        success: false,
        message,
        details: error.stack || null,
    });
});
exports.default = router;
