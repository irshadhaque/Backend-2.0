import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// dotenv.config({
//     path: './env'
// })

// require('dotenv').config()

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log(`MongoDB Connected !! DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error){
        console.log("MongoDB Connection Failed in index.db.js : ",error);
        process.exit(1);
    }
}
export default connectDB