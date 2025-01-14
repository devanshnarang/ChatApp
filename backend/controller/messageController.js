import ChatModel from "../models/chatModels.js";
import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";
import CryptoJS from "crypto-js";


const SECRET_KEY="DEVANSH_NARANG_2004";


const decryptMessage = (encryptedMessage, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedMessage;
};

const encryptMessage = (message,secret_key)=>{
  return CryptoJS.AES.encrypt(message,secret_key).toString();
}

export const sendmessageController = async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    return res.status(400).send({
      success: false,
      message: "Try sending message again!!",
    });
  }

  // Encrypt the content before storing it in the database
  const encryptedMessage = encryptMessage(content, SECRET_KEY);

  const newMessage = {
    sender: req.user._id,
    content: encryptedMessage, // store encrypted content
    chat: chatId,
  };

  try {
    // Create the message in the database
    let message = await messageModel.create(newMessage);

    // Now populate the sender and chat information
    message = await messageModel.findById(message._id)
      .populate("sender", "name pic")
      .populate("chat")

    // Now populate the users in the chat object
    message = await userModel.populate(message, {
      path: 'chat.users',
      select: "name pic email",
    });

    // Decrypt the message content before sending it to the frontend
    const decryptedContent = decryptMessage(message.content, SECRET_KEY);
    
    // Update the content field to send the decrypted message
    message.content = decryptedContent;

    // Update the chat with the latest message
    await ChatModel.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    // Send the message with decrypted content to the frontend
    return res.json(message);
  } catch (error) {
    console.error("Error while sending message:", error);
    return res.status(404).send({
      success: false,
      message: "Resend the message!!",
    });
  }
};


export const allMessagesController = async(req,res)=>{
    try {
        const messages = await messageModel.find({chat:req.params.chatId}).populate("sender","name pic email").populate("chat");
        const decryptedMessages = messages.map((message) => ({
          ...message.toObject(),
          content: decryptMessage(message.content, SECRET_KEY),
        }));
        res.json(decryptedMessages);
    } catch (error) {
        res.status(404).send({
            success:false,
            message:error
        })
    }
}

const deleteMessageController = async(req,res)=>{
  try {
    const {messageId,userId}=req.params;
    const message = await messageModel.findById(messageId);
    if(!message){
      return res.status(200).send({
        success:false,
        message:"No message found!!"
      })
    }
    if(message.sender._id.toString()!==req.user._id){
      return res.status(403).send({
        success: false,
        message: "You can't delete  message!",
      });

      await messageModel.findByIdAndDelete(messageId);
      message.chat

    }
  } catch (error) {
    return res.status(400).send({
      success:false,
      message:error.message,
    })
  }
}

export const markAsReadController = async(req,res)=>{
  const { messageIds } = req.body; 

  if (!messageIds || !Array.isArray(messageIds)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    const result = await messageModel.updateMany(
      { _id: { $in: messageIds } }, 
      { $set: { isRead: true } } // 
    );

    return res.status(200).json({
      success: true,
      message: `${result.nModified} messages marked as read.`,
    });
  } catch (error) {
    console.error("Error updating messages:", error);
    return res.status(500).json({ error: "Failed to update messages." });
  }
}