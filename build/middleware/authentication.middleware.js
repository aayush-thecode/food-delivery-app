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
exports.Authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const users_model_1 = __importDefault(require("../models/users.model"));
const errorhandeler_middleware_1 = require("./errorhandeler.middleware");
const Authenticate = (roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const authHeader = req.headers["authorization"];
            if (!authHeader || !authHeader.startsWith("BEARER")) {
                throw new errorhandeler_middleware_1.CustomError("Unauthorized, Authorization token is missing", 401);
            }
            const access_token = authHeader.split(" ")[1];
            if (!access_token) {
                throw new errorhandeler_middleware_1.CustomError("Unauthorized, token is missing", 401);
            }
            const decoded = (0, jwt_utils_1.verifyToken)(access_token);
            if (decoded.exp && decoded.exp * 1000 > Date.now()) {
                throw new errorhandeler_middleware_1.CustomError("Unauthorized, access denied", 401);
            }
            if (!decoded) {
                throw new errorhandeler_middleware_1.CustomError("Unauthorized, Invalid token", 401);
            }
            const user = yield users_model_1.default.findById(decoded._id);
            if (!user) {
                throw new errorhandeler_middleware_1.CustomError("User not found", 404);
            }
            if (roles && !roles.includes(user.role)) {
                throw new errorhandeler_middleware_1.CustomError(`Forbidden, ${user.role} can not access this resource`, 401);
            }
            // ts-expect-error
            req.user = {
                _id: decoded._id,
                firstName: decoded.firstName,
                lastName: decoded.lastName,
                role: decoded.role,
                email: decoded.email,
            };
            next();
        }
        catch (err) {
            next(err);
        }
    });
};
exports.Authenticate = Authenticate;
