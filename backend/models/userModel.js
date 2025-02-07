import mongoose from "mongoose";

const userSchema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    pic:{type:String,default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"},
    publicKey:{type:String,required:true},
    privateKey:{type:String,default:""},
    salt: { type: String,default:''},
    iv: { type: String,default:''},
},{timestamps:true});

userSchema.pre('save',async function (next) {
    if(!this.isModified("password"))return next();
    next();
})

const userModel=mongoose.model("Users",userSchema);

export default userModel;