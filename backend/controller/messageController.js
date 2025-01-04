import ChatModel from "../models/chatModels.js";
import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";

export const sendmessageController = async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    return res.status(400).send({
      success: false,
      message: "Try sending message again!!",
    });
  }
  var newmessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  try {
    var message = await messageModel.create(newmessage)
    message = await message.populate("sender","name pic")
    message = await message.populate("chat")
    message = await userModel.populate(message,{
        path:'chat.users',
        select:"name pic email",
    })
    await ChatModel.findByIdAndUpdate(req.body.chatId,{
        latestMessage:message,
    })
    return res.json(message);
  } catch (error) {
    return res.status(404).send({
        success:false,
        message:"Resend the message!!"
    })
  }
};

export const allMessagesController = async(req,res)=>{
    try {
        const messages = await messageModel.find({chat:req.params.chatId}).populate("sender","name pic email").populate("chat")
        res.json(messages)
    } catch (error) {
        res.status(404).send({
            success:false,
            message:error
        })
    }
}
