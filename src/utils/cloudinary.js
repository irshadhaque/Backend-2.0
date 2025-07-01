import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        //upload file here
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"//decides by itself which file format is uploaded
        })
        //file uploaded successfully
        console.log("file uploaded on cloudinary", response.url);
        return response;
        
    } catch(error){
        fs.unlinkSync(localFilePath)//syncronously removes locally saved temp file as upload got failed
        return null;
    }
}

export default uploadOnCloudinary;