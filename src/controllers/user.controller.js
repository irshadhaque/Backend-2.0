import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken //save refresh token in db. user is a object 
        await user.save({validateBeforeSave: false}) //To skip validation for refreshToken field such as password, email, etc.

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Error generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
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

    const { fullName, email, username, password } = req.body

    if ([fullName, email, username, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }//can write directly using && to make it easy

    const existingUser = await User.findOne({$or: [{ email }, { username }]}); 
    //User is imported from mongoose model and findOne is a mongoose method to find a single document
    if (existingUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path 
    //multer adds this field to req.files. avatar was defined in user.routes.js
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    console.log("req.files:", req.files);
    console.log("req.body:", req.body);

    const { default: uploadOnCloudinary } = await import("../utils/cloudinary.js");//dynamic import to avoid circular dependency issues

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {//no avatar uploaded
        throw new ApiError(500, "Avatar upload failed")
    }

    const user = await User.create({//create a new user in db
        fullName,
        email,
        username: username.toLowerCase(), //username should be in lowercase
        password,
        avatar: avatar.url, //cloudinary url
        coverImage: coverImage?.url || "" //optional
    })
    //user created successfully
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "User creation failed")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully"))

})

const loginUser = asyncHandler(async (req, res) => {
    //----steps
    //get user details from frontend (req.body)
    //validation
    //check if user exists in db
    //check if password is correct
    //generate access token and refresh token
    //send in cookies
    //save refresh token in db
    //return response

    const { email, username, password } = req.body;//destructuring from req.body
    if (!(username || email)) {
        throw new ApiError(400, "Email or username is required")
    }//login can be done using email or username based on requirement

    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({ $or: [{ email }, { username }] })//User.findOne is mongoDB mongoose method
    //find user by email or username
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if( !(await user.isPasswordCorrect(password))) {//user.isPasswordCorrect is a method defined by us so use user not User. done through bcrypt
        throw new ApiError(401, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")//optional step

    const options = {
        httpOnly: true, //cookie is not accessible by javascript
        secure: true, //cookie is only sent over https. cookie cannot be modified by client
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)//key, value, options. .cookie is a method from cookie-parser middleware
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, 
        {
            user: loggedInUser,
            accessToken, //send access token in response
            refreshToken //send refresh token in response
            //already set in cookies but can be sent if user wants to save it in local storage for some reason
    }, "User logged in successfully"))

})

const logoutUser = asyncHandler(async (req, res) => {
    //----steps
    //get user from req.user
    //remove refresh token from db
    //clear cookies
    //return response

    await User.findByIdAndUpdate(//removing from DB
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true//mongoDB returns updated user
        }
    )

    const options = {
        httpOnly: true, //cookie is not accessible by javascript
        secure: true, //cookie is only sent over https. cookie cannot be modified by client
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))//no data sent this time {}
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    //----steps
    //get refresh token from cookies
    //verify refresh token using jwt.verify
    //if valid, generate new access token and refresh token
    //save refresh token in db
    //send new access token and refresh token in cookies

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken?._id);// find user by id from decoded token
    
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh  Token is Expired or Used");
        }
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {
            accessToken,
            newRefreshToken
        },
        "Access Token Refreshed Successfully")
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) =>{
    //----steps
    //get user from req.user
    //get old password and new password from req.body
    //validate old password
    //check if old password is correct
    //if correct, update password in db
    //return response

    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid Password Entered");
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})//save is used in pre hook to modify password. check in user model
    
    return res.status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200)
    .json(200, req.user, "User fetched successfully");
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    //----steps
    //get new avatar from user
    //upload on cloudinary
    //update avatar in db
    //return res
    const avatarLocalPath = req.file?.path //files is an array req.file is a single file

    if(!avatarLocalPath){
        throw new ApiError("400", "Failed to upload avatar, Missing");
    }
//deleting old avatar
    const existingUser = await User.findById(req.user._id)
    
    if(existingUser?.avatar){
        await deleteFromCloudinary(existingUser.avatar)
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
         throw new ApiError("400", "Failed to upload avatar on Cloudinary");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "Avatar changed successfully"))
})

const updateUserCoverImage = asyncHandler(async(req, res) => {

    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiError("400", "Missing cover image");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
         throw new ApiError("400", "Failed to upload cover image on Cloudinary");
    }

    const user = awaitUser.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "cover image changed successfully"))
})

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};