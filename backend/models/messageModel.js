import mongoose from "mongoose";

const messageMode=mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId,ref:"Users"},
    tocontent:{type:String,trim:true},
    fromcontent:{type:String,trim:true},
    chat:{type:mongoose.Schema.Types.ObjectId,ref:"Chat"},
    isRead:{type:Boolean,default:false},
    messageSeen:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Users",
            },
        ],
},{timestamps:true,});

const messageModel=mongoose.model("Message",messageMode);

export default messageModel;