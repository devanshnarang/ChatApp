//chatName
//isGroupChat
//users
//latestMessage
//groupAdmin
import mongoose from "mongoose";

const chatModel = mongoose.Schema({
    chatName:{type:String,trim:true},
    isGroupChat:{type:Boolean,default:false},
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Users",
        },
    ],
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
    },
    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
    }
},{timestamps:true});

const ChatModel=mongoose.model("Chat",chatModel);

export default ChatModel;