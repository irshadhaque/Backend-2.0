import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    watchHIstory : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    }
    ],
    username : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName : {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar : {
        type: String, //cloudinary url
        required: true
    },
    coverImage : {
        type: String,
    },
    password : {
        type: String,
        required: [true, "Password is required"],
        min : 8,
    },
    refreshToken : {
        type: String
    }
    },
    {timestamps: true}
);

userSchema.pre("save", async function(next) {
    //pre hook before saving to db
    if(!this.isModified("password")) return next();
    //if password is modified(set or updated) then call only to hash else keep same 
    
    this.password = await bcrypt.hash(this.password, 10)  //10 round
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)//boolean value
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this.id,
        email : this.email,
        username : this.username,
    },
process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn : process.env.ACCESS_TOKEN_EXPIRY
})}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this.id,
    },
process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn : process.env.REFRESH_TOKEN_EXPIRY
})}

export const User = mongoose.model("User", userSchema)