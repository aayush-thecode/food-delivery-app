import mongoose from 'mongoose'

export default function connectDatabase(url: string){

    mongoose.connect(url)
    .then(() => {
        console.log('Database connected')
    }).catch ((err) => {
        console.log('db connect error')
    })
}