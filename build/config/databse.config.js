"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
function connectDatabase(url) {
    mongoose_1.default.connect(url)
        .then(() => {
        console.log('Database connected');
    }).catch((err) => {
        console.log('db connect error', err);
    });
}
