import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler( async (req, res) =>{
    //----steps
    // get user details from frontend
    //validations
    //check if user already exists: username(ig), email
    //check for images, check for avatar
    //upload to cloudinary, avatar-mul-to-cldnry
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user actually created or not
    //return response
    
    const {fullName, email, username, password} = req.body
    
    if([fullName, email, username, password].some(field => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    User.findOne({$or: [{email}, {username}]}).then(user => {//or query using dollar operator
        if(user){
            throw new ApiError(409, "User already exists with this email or username")
        }
    })

    const avatarLocalPath = req.files?.avatar?.[0]?.path //multer adds this field to req.files
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
})

export {registerUser}