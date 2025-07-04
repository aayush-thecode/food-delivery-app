import 'dotenv/config' 
import userRoutes from './routes/user.routes'
import express, { NextFunction, Request, Response } from 'express'
import connectDatabase from './config/databse.config';
import foodTypeRoutes from './routes/foodtype.routes'
import path from 'path';
import categoryRoutes from './routes/category.routes'
import reviewRoutes from './routes/review.routes'
import cartRoutes from './routes/cart.routes';
import paymentRoutes from './routes/payment.routes';
import { CustomError } from './middleware/errorhandeler.middleware';
import cors from 'cors';
// import cookieParser from 'cookie-parser';


const app = express();

const DB_URI = process.env.DB_URI || '';
const PORT = process.env.PORT || 8080;

connectDatabase(DB_URI)


//using middleware
// const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(cors({
    origin: '*', 
    credentials: true,
}));
// app.use(cookieParser());
app.use(express.urlencoded({extended: false }));
app.use(express.json());



//serving static files
app.use('/api/uploads',express.static(path.join(__dirname,'../', 'uploads')))


//using routes
app.use('/api/user', userRoutes)
app.use('/api/menu', foodTypeRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);


//health check route
app.use('/',(req:Request, res:Response) => {
    res.status(200).json({message:'server is up & running'});
})

// handle not found path 
app.all('*', (req:Request, res:Response, next:NextFunction) => {

    const message = `can not ${req.method} on ${req.originalUrl}`

    const error = new CustomError(message, 404)
    next(error);

})

//error handeler
app.use((error:any, req:Request, res:Response, next: NextFunction) => {
    const statusCode = error.statusCode || 500
    const status = error.status || 'error'
    const message = error.message || 'something went wrong!'

    res.status(statusCode).json ({
        status: status,
        success: false,
        message: message
    })
})



app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`)
});