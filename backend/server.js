import express from 'express';
import { chats } from './data.js';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import charRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { Server } from 'socket.io';  
import messageModel from './models/messageModel.js';
import ChatModel from './models/chatModels.js';

dotenv.config(); 
const app = express();

connectDB();

app.use(express.json());
app.use(cors({ 
    origin: ['http://localhost:3000','https://cjkvr9gl-3000.inc1.devtunnels.ms/'],
    credentials:true,
}));

app.get('/', (req, res) => {
    res.send("API is running.");
});

app.use('/api/user', userRoutes);
app.use('/api/chat', charRoutes);
app.use('/api/message', messageRoutes);

app.get('/api/chat/:id', (req, res) => {
    const currentChat = chats.find((c) => c._id === req.params.id);
    res.send(currentChat);
});

const server = app.listen(8080, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});



const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000',
    },
});

io.on("connection", (socket) => {
    console.log("connected to socket.io");
    socket.on('setup',(userData)=>{
        socket.join(userData._id);
        console.log(`User ${userData._id} joined their room`);
        socket.emit('connected');
    });

    socket.on('join chat',(room)=>{
        socket.join(room);
        console.log("User Joined Room: " + room);
    })

    socket.on("typing",(room)=>socket.in(room).emit("typing"))
    socket.on("stop typing",(room)=>socket.in(room).emit("stop typing"))

    socket.on("message-read", async ({ loggedUser, senderUser, chatId }) => {
        const msgg = await messageModel.find({ chat: chatId });
        let tempmsg = [];
        
        // Use for...of loop to handle async operations properly
        for (const msg of msgg) {
            let a = await messageModel.findByIdAndUpdate(msg._id, { isRead: true }, { new: true });
            tempmsg.push(a);
        }
        console.log(senderUser);
        socket.to(senderUser).emit("senderDoubleTick",tempmsg);
    });
    
    

    socket.on("new message",(newMessageReceived)=>{
        var chat=newMessageReceived.chat;
        if(!chat.users)return console.log("chat.users not defined");
        chat.users.forEach(user => {
            if(user._id===newMessageReceived.sender._id){
                return;
            }
            socket.in(user._id).emit("message received",newMessageReceived);
        });
    })
            

    socket.on("deleteMessage", async (messageId) => {
        try {
            const deletedMessage = await messageModel.findByIdAndDelete(messageId);
    
            if (!deletedMessage) {
                return socket.emit("error", "Message not found");
            }


            const chatRoom = deletedMessage.chat; 
            io.in(chatRoom).emit("messageDeleted", messageId);
        } catch (error) {
            console.error("Error deleting message:", error);
            socket.emit("error", "Failed to delete the message");
        }
    });

    socket.on("deleteChat", async (chatId) => {
        try {
            // Backend DB deletion logic
            const deleteChat = await ChatModel.findByIdAndDelete(chatId);
    
            if (!deleteChat) {
                return socket.emit("error", "Message not found");
            }

            io.emit("chatDeleted", chatId);
        } catch (error) {
            console.error("Error deleting message:", error);
            socket.emit("error", "Failed to delete the chat");
        }
    });
    
});
