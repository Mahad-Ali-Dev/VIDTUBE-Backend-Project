import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)
// encryption through hash method 
// ecrpyting the password just before saving it to DB using pre() method , it will take two 
// parameters , one be the method and second will also be a customize method , can be asyncronous 
// then that fucntion hold the next bcz it is in between the request and response .
// here i use bycrypt library for encryption
userSchema.pre("save", async function (next) {
      //if the password is not modified then it must go to next ,
    if(!this.isModified("password")) return next();
     // else it should encrpt the password
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// decryption 
// isPasswordCorrect() method will check the password provided by user by 
// decrypting the password using compare method of bycrypt library . 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}
// genrating access token 
userSchema.methods.generateAccessToken = function(){
    // short lived Access token
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// generating refresh token 
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)