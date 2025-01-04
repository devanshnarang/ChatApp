import express from 'express';
import { chats } from './data.js';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import charRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { Server } from 'socket.io';  

dotenv.config(); 
const app = express();

connectDB();

app.use(express.json());
app.use(cors({ 
    origin: 'http://localhost:3000',
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
});
