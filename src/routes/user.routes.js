import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([//multer adds this field to req.files
        {
            name:"avatar",//name must be same in frontend
            maxCount:1
        }, {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)
// router.route("/login").post(registerUser)

export default router;