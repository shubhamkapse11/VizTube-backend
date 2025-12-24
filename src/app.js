import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credential:true
}))

app.use(express.json({
    limit:"16kb"
}))

app.use(express.urlencoded({extented:true , limit:"16kb"}))
app.use(express.static("public"));  // This line tells Express to serve static files from the public folder.
app.use(cookieParser())

// import routes 

import userRouter from  './routes/user.routes.js'


// Routes Declareation
app.use("/api/v1/users" , userRouter)



export { app }
