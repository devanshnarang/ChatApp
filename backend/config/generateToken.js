import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const generateToken=(user)=>{
    const payload={
        id:user._id,
        email:user.email
    };

    const Token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"30d"})
    return Token;
}

export default generateToken;