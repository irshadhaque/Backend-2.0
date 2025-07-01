import app from "./app.js";
import connectDB from "./db/index.db.js";
import dotenv from "dotenv";
dotenv.config();

connectDB()
    .then(() => {
        app.on("error", (error) => {                //listener
            console.log("ERROR : ", error);
            throw error;
        })

        app.listen(process.env.PORT || 8000, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO DB connection failure!!", err);
    });


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