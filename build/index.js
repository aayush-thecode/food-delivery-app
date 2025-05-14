"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const express_1 = __importDefault(require("express"));
const databse_config_1 = __importDefault(require("./config/databse.config"));
const foodtype_routes_1 = __importDefault(require("./routes/foodtype.routes"));
const path_1 = __importDefault(require("path"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const errorhandeler_middleware_1 = require("./middleware/errorhandeler.middleware");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const DB_URI = process.env.DB_URI || '';
const PORT = process.env.PORT || 8080;
(0, databse_config_1.default)(DB_URI);
//using middleware
const FRONTEND_URL = process.env.FRONTEND_URL;
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
}));
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
//serving static files
app.use('/api/uploads', express_1.default.static(path_1.default.join(__dirname, '../', 'uploads')));
//using routes
app.use('/api/user', user_routes_1.default);
app.use('/api/menu', foodtype_routes_1.default);
app.use('/api/category', category_routes_1.default);
app.use('/api/review', review_routes_1.default);
//health check route
app.use('/', (req, res) => {
    res.status(200).json({ message: 'server is up & running' });
});
// handle not found path 
app.all('*', (req, res, next) => {
    const message = `can not ${req.method} on ${req.originalUrl}`;
    const error = new errorhandeler_middleware_1.CustomError(message, 404);
    next(error);
});
//error handeler
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const status = error.status || 'error';
    const message = error.message || 'something went wrong!';
    res.status(statusCode).json({
        status: status,
        success: false,
        message: message
    });
});
app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});
