import 'dotenv/config'

import express from 'express'
import connectDatabase from './config/databse.config';

const app = express();

const Db_uri = process.env.Db_uri || ''
const PORT = process.env.PORT || 8080;

connectDatabase(Db_uri)

//using middleware 
app.use(express.urlencoded ({ extended:false}));

//handle not found path 
// app.all('*', (req:Request, res:Response, next:Next) {

//     const message = `cannot `
// })

app.listen(PORT, () => {
    console.log(`app listening at port ${PORT}`)
});