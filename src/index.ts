import 'dotenv/config'
import userRoutes from './routes/user.routes'
import express, { NextFunction, Request, Response } from 'express'
import connectDatabase from './config/databse.config';
import { CustomError } from './middleware/errorhandeler.middleware';
import productRoutes from './routes/product.routes'

const app = express();

const Db_uri = process.env.Db_uri || ''
const PORT = process.env.PORT || 8080;

connectDatabase(Db_uri)

//using middleware 
app.use(express.urlencoded ({ extended:false}));


//using routes
app.use('/api/user/', userRoutes)
app.use('/api/products', productRoutes)


//handle not found path 
app.all('*', (req:Request, res:Response, next:NextFunction) => {

    const message = `cannot ${req.method} on $a{req.originalUrl}`

    const error = new CustomError(message, 404)
    next(error) 
})

//error handler

app.use((error:any, req: Request, res:Response, next:NextFunction) => {
    const statusCode = error.statusCode || 500
    const message = error.message || 'something went wrong!'
    const status = error.status || 'error'

    res.status(statusCode).json ({
        stuatus: status,
        success: false,
        message: message
    })
})

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`)
});