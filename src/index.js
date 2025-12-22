// require('dotenv').config({path : './env'})
// import mongoose from "mongoose";
// import {DB_NAME} from "./constants";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import express  from 'express';
// dotenv.config({ path: "./env" });
dotenv.config();   // will automatically load ".env"
const app = express();

connectDB().then(()=>{
    app.on("error" , (err)=> {
        console.log("error on indexjs in app" , err)
    })
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log("db connected sucessfully")
    })
}).catch((err) => {
  console.error("Failed to connect to the database!! :", err);
  process.exit(1);
} );









// import express from "express"
// const app = express();

// ;(async()=>{
// try{
//    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//    app.on('error' ,(err)=>{
// console.log(err)
// throw err
//    })

//    app.listen(process.env.PORT , ()=>{
//     console.log("listening to my app" , process.env.PORT)
//    })
// }catch(err){
//     console.log("err hamppen  ehile connecin to db")
//     console.error("err", err)
//     throw err
// }
// })()