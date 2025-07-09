import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _ , next) => {//if res is not present we can simply give _ instead of res
    //----steps
    //get token from cookies
    //verify token using jwt.verify
    //if valid, set user in req.user
    //if invalid, return error response

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "" ); //get access token from cookies. done through cookie-parser middleware. accessToken may not be present if user is using mobile app or other clients that dont support cookies

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user; //set user in req.user
        next(); //call next middleware or route handler
    } catch (error) {
        throw new ApiError(403, error.message || "Invalid Access Token");
    }
})