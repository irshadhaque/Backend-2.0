import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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

export default router;