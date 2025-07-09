import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload file here
        const normalizedPath = path.resolve(localFilePath);
        const response = await cloudinary.uploader.upload(normalizedPath, {
            resource_type: "auto"//decides by itself which file format is uploaded
        })
        //file uploaded successfully
        console.log("file uploaded on cloudinary", response.url);
        // fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error?.message || error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // cleanup only if file exists
        }
        return null;
    }
}

const deleteFromCloudinary = async (fileUrl) => {

    if (!fileUrl) return;

    try {
        const parts = fileUrl.split('/');
        const fileName = parts[parts.length - 1] || ""; // abc_xyz.jpg
        const [publicId] = fileName.split('.');

        if(!publicId)return;
        
        await cloudinary.uploader.destroy(publicId);
        console.log("File deleted from Cloudinary:", publicId);
    }
    catch (error) {
        console.error("Cloudinary deletion failed:", error.message);
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };