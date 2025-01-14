import ChatModel from "../models/chatModels.js";
import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";


export const accessChatsController=async(req,res)=>{
    const {userId}=req.body;
    if(!userId){
        console.log("UserId param not sent. ");
        return res.status(400);
    }
    //if chat exists;
    var isChat=await ChatModel.find({
        isGroupChat:false,
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}},
        ],
    }).populate("users","-password")
      .populate("latestMessage");

    isChat=await userModel.populate(isChat,{
        path:"latestMessage.sender",
        select:"name pic email",
    });
    if(isChat.length>0){
        return res.send(isChat[0]);
    }else{
        var chatData={
            chatName:"sender",
            isGroupChat:false,
            users:[req.user._id,userId],
        };
        try {
            const createdChat= await ChatModel.create(chatData);
            const FullChat = await ChatModel.findOne({_id:createdChat._id}).populate("users","-password");
            return res.status(200).send(FullChat);
        } catch (error) {
            return res.status(400).send({
                message:error.message,
            })
        }
    }
};

export const fetchChatsController=async(req,res)=>{
    try {
        const chats=await ChatModel.find({
            users:{$elemMatch:{$eq:req.user._id}}
        }).populate("users","-password")
          .populate("groupAdmin","-password")
          .populate("latestMessage")
          .sort({updatedAt: -1});
        const populatedChats = await userModel.populate(chats,{
            path:"latestMessage.sender",
            select:"name pic email",
        })
        return res.status(200).send({
            success:true,
            chats:populatedChats,
        });
    } catch (error) {
        console.log("Error in fetching chats!! ");
        return res.status(500).send({
            error:error.message,
            success:false,
            message:error.message,
        });
    }
};

export const creategroupChatController=async(req,res)=>{
    try {
        if(!req.body.users || !req.body.name){
            return res.status(400).send({
                message:"Please fill all the fields. ",
                success:false
            })
        }
        var users=JSON.parse(req.body.users);
        if(users.length<2){
            return res.status(400).send({
                message:"More than 2 users are required to form a group chat. ",
                success:false
            })
        }
        users.push(req.user);
        try {
            const groupChat= await ChatModel.create({
                chatName:req.body.name,
                users:users,
                isGroupChat:true,
                groupAdmin:req.user,
            });

            const fullGroupChat= await ChatModel.findOne({
                _id:groupChat._id
            }).populate("users","-password")
              .populate("groupAdmin","-password")

            return res.status(200).json(fullGroupChat);

        } catch (error) {
            return res.status(400).send({message:error.message});
        }
    } catch (error) {
        
    }
}

export const renameGroupController=async(req,res)=>{
    try {
        const {chatId,chatName}=req.body;
        console.log("Enterring controller");
        const updatedChat=await ChatModel.findByIdAndUpdate(
            chatId,{
                chatName:chatName,
            },{
                new:true,
            }
        )
         .populate("users","-password")
          .populate("groupAdmin","-password")

        if(!updatedChat){
            return res.status(404).send({message:error.message});
        }
        else{
            return res.json(updatedChat);
        }
    } catch (error) {
        return res.send({message:error.message});
    }
};

export const groupAddController=async(req,res)=>{
    try {
        const {chatId,userId}=req.body;
        const added = await ChatModel.findByIdAndUpdate(chatId,{
            $push:{users:userId},
        },{new:true}).populate("users","-password")
         .populate("groupAdmin","-password");

        if(!added){
            return res.status(404).send({
                success:false,
                message:error.message,
            })
        }
        else{
            return res.status(200).send({
                added,
                success:true,
                message:"Succesfully Added. ",
            })
        }
    } catch (error) {
        return res.status(400).send({
            success:false,
            message:"Can't add user in the group. ",
        })
    }
};

export const removeFromGroupController=async(req,res)=>{
    try {
        const {chatId,userId}=req.body;
        const removed = await ChatModel.findByIdAndUpdate(chatId,{
            $pull:{users:userId},
        },{new:true}).populate("users","-password")
         .populate("groupAdmin","-password");

        if(!removed){
            return res.status(404).send({
                success:false,
                message:error.message,
            })
        }
        else{
            return res.status(200).send({
                removed,
                success:true,
                message:"Succesfully removed. ",
            })
        }
    } catch (error) {
        return res.status(400).send({
            success:false,
            message:"Can't add user in the group. ",
        })
    }
};

