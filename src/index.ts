import 'dotenv/config'
import userRoutes from './routes/user.routes'
import express, { NextFunction, Request, Response } from 'express'
import connectDatabase from './config/databse.config';
import { CustomError } from './middleware/errorhandeler.middleware';
import productRoutes from './routes/product.routes'
import { Together } from "together-ai";
import chatRoutes from './routes/chat.routes'
import path from 'path';


const app = express();

const Db_uri = process.env.Db_uri || ''
const PORT = process.env.PORT || 8080;

connectDatabase(Db_uri)


//using middleware 
app.use(express.urlencoded ({ extended:false}));
app.use('/api/uploads',express.static(path.join(__dirname,'../', 'uploads')))


//using routes
app.use('/api/user/', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/chat', chatRoutes)



//call the function with the promopt 
const together = new Together ({
  apiKey : process.env.TOGETHER_AI_API_KEY as string, // type assertion
});

//define an async function to get chatbox response 

async function getChatResponse(prompt: string): Promise<void> {
  try {
    const response = await together.chat.completions.create ({
      messages: [{ role: 'user', content: prompt }],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    });

    console.log(response.choices[0].message?.content);

  } catch (error) {

    console.log("error fetching response:", error);
  }
}

//initialize together API with API key 

getChatResponse("what are some fun things to do in food app?")

//handle not found path 
app.all('*', (req:Request, res:Response, next:NextFunction) => {

    const message = `cannot ${req.method} on ${req.originalUrl}`

    const error = new CustomError(message, 404)
    next(error) 
})

//error handler

app.use((error:any, req: Request, res:Response, next:NextFunction) => {
    const statusCode = error.statusCode || 500
    const message = error.message || 'something went wrong!'
    const status = error.status || 'error'

    res.status(statusCode).json ({
        status: status,
        success: false,
        message: message
    })
})

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`)
});