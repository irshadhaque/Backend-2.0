import { Router } from "express";
import { 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelDetails, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage 
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([//multer adds this field to req.files...upload is a middleware that handles file uploads, import from multer.middleware.js
        {
            name:"avatar",//name must be same in frontend
            maxCount:1
        }, {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)


//secured routes

router.route("/logout").post(verifyJWT, logoutUser)//verifyJWT middleware is used

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)//only logged in users should be able to change password so we use verifyJWT middleware

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/channel/:username").get(verifyJWT, getUserChannelDetails)

router.route("/history").get(verifyJWT, getWatchHistory)

export default router;