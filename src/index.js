// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
import connectDB from "./db/index.db.js";
import dotenv from "dotenv";
dotenv.config();

connectDB();







/*
;( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error", (error) =>{                //listener
            console.log("ERROR : ",error);
            throw error;    
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    } catch (error){
        console.log("ERROR : ",error);
        
    }
})()//IIFE

*/