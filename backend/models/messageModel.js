import mongoose from "mongoose";

const messageMode=mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId,ref:"Users"},
    content:{type:String,trim:true},
    chat:{type:mongoose.Schema.Types.ObjectId,ref:"Chat"},
    isRead:{type:Boolean,default:false}
},{timestamps:true,});

const messageModel=mongoose.model("Message",messageMode);

export default messageModel;