import 'dotenv/config'
import userRoutes from './routes/user.routes'
import express from 'express'
import connectDatabase from './config/databse.config';
import foodTypeRoutes from './routes/foodtype.routes'
import chatRoutes from './routes/chatbot.routes'
import path from 'path';
import categoryRoutes from './routes/category.routes'
import reviewRoutes from './routes/review.routes'


const app = express();

const Db_URI = process.env.Db_URI || ''
const PORT = process.env.PORT || 8080;

connectDatabase(Db_URI)


//using middleware 
app.use(express.urlencoded ({ extended:false}));
app.use('/api/uploads',express.static(path.join(__dirname,'../', 'uploads')))


//using routes
app.use('/api/user', userRoutes)
app.use('/api/foodtype', foodTypeRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/review', reviewRoutes)



app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`)
});