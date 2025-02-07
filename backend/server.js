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
import userModel from './models/userModel.js';

dotenv.config();
const app = express();

connectDB();

app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true,
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
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
});

const onlineUsers = new Map();  // Global mapping: userId => socket.id

io.on("connection", (socket) => {
    console.log("Connected to socket.io:", socket.id);

    // When the user logs in, store their socket and join their personal room.
    socket.on('setup', (userData) => {
        console.log("User data in setup:",userData._id);
        onlineUsers.set(userData._id, socket.id);  // Save user ID with socket ID
        socket.join(userData._id);                  // Personal room for global events
        console.log(`User ${userData._id} joined their room`);
        socket.emit('connected');
    });



    // Room-based joining for chat-specific events
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    // Typing indicators (chat room based)
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    // When messages are read, update both the sender and the logged user using their global sockets.
    socket.on("message-read", async ({ loggedUser, senderUser, chatId }) => {
        try {
            // Fetch the chat to ensure validity and to get the list of users
            const chat = await ChatModel.findById(chatId).populate("users");
            if (!chat) {
                console.error("Chat not found");
                return;
            }

            // If it's a group chat, update read status individually.
            if (chat.isGroupChat) {
                const unreadMessages = await messageModel.find({
                    chat: chatId,
                    isRead: false,
                    sender: { $ne: loggedUser },
                });

                if (unreadMessages.length === 0) {
                    console.log("No unread messages in this group chat to mark as read");
                    return;
                }

                // Mark messages as read for the logged user
                const updatedMessages = await Promise.all(
                    unreadMessages.map(async (msg) => {
                        msg.readBy.push(loggedUser); // Track that the logged user has read the message
                        if (msg.readBy.length === chat.users.length) {
                            // All users have read the message, update status
                            msg.isRead = true;
                        }
                        return msg.save();
                    })
                );
                // Notify the sender using the global socket (if online)
                const senderSocketId = onlineUsers.get(senderUser);
                if (senderSocketId) {
                    io.to(senderSocketId).emit("viewedBy", updatedMessages);
                }
            }

            // Ensure the logged user is part of the chat
            if (!chat.users.some((user) => user._id.toString() === loggedUser)) {
                console.error("Logged user is not part of this chat");
                return;
            }

            // For one-on-one chats: find unread messages (not sent by the logged user)
            const unreadMessages = await messageModel.find({
                chat: chatId,
                isRead: false,
                sender: { $ne: loggedUser },
            });

            if (unreadMessages.length === 0) {
                return;
            }

            // Update all unread messages to mark them as read
            const updatedMessages = await Promise.all(
                unreadMessages.map((msg) =>
                    messageModel.findByIdAndUpdate(msg._id, { isRead: true }, { new: true })
                )
            );

            // Notify the sender using their global socket
            const senderSocketId = onlineUsers.get(senderUser);
            if (senderSocketId) {
                io.to(senderSocketId).emit("senderDoubleTick", updatedMessages);
            }
            // Also notify the logged user (in case you want to update UI there as well)
            const loggedUserSocketId = onlineUsers.get(loggedUser);
            if (loggedUserSocketId) {
                io.to(loggedUserSocketId).emit("updateForloggedUser", updatedMessages);
            } else {
                console.log(`User ${loggedUser} is not online`);
            }

        } catch (error) {
            console.error("Error updating message read status:", error);
        }
    });

    // New message event: emit directly to each recipient via their global socket
    socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;
        if (!chat.users) return console.log("chat.users not defined");
        chat.users.forEach(user => {
            // Skip the sender of the message
            if (user._id === newMessageReceived.sender._id) return;

            // Get the recipient's socket ID from the onlineUsers map
            const recipientSocketId = onlineUsers.get(user._id);
            console.log(recipientSocketId);
            if (recipientSocketId) {
                console.log("Calling in recipients Id ");
                io.to(recipientSocketId).emit("message received", newMessageReceived);
                io.to(recipientSocketId).emit("updateUnreadRedCount", newMessageReceived);
                io.to(recipientSocketId).emit("updateForloggedUser", newMessageReceived);
            }
        });
    });

    // Delete a message and notify all members in the chat room
    socket.on("deleteMessage", async (messageId) => {
        try {
            const deletedMessage = await messageModel.findByIdAndDelete(messageId);
            if (!deletedMessage) {
                return socket.emit("error", "Message not found");
            }
            // Notify the entire chat room about the deletion
            const chatRoom = deletedMessage.chat;
            io.to(chatRoom.toString()).emit("messageDeleted", messageId);
            console.log("BACKEND CALLING - message deleted");
        } catch (error) {
            console.error("Error deleting message:", error);
            socket.emit("error", "Failed to delete the message");
        }
    });

    // Delete a chat and notify everyone (global broadcast)
    socket.on("deleteChat", async (chatId) => {
        try {
            const deleteChat = await ChatModel.findByIdAndDelete(chatId);
            if (!deleteChat) {
                return socket.emit("error", "Chat not found");
            }
            io.emit("chatDeleted", chatId);
        } catch (error) {
            console.error("Error deleting chat:", error);
            socket.emit("error", "Failed to delete the chat");
        }
    });

    // Fetch recent chats and send them to the requester
    socket.on("fetchRecentChats", async (userId) => {
        try {
            const updatedChats = await ChatModel.find({
                users: { $elemMatch: { $eq: userId } }
            })
                .populate("users", "-password")
                .populate("groupAdmin", "-password")
                .populate("latestMessage")
                .sort({ updatedAt: -1 });

            const populatedChats = await userModel.populate(updatedChats, {
                path: "latestMessage.sender",
                select: "name pic email",
            });
            socket.emit("chatupdated", populatedChats);
        } catch (error) {
            console.log("BACKEND error occurred during fetchRecentChats");
            socket.emit("error", "Failed to reload chats");
        }
    });

    //disconnect
    socket.on("disconnect", () => {
        // Iterate over onlineUsers to remove the disconnected socket
        for (let [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);
            console.log(`Socket disconnected. Removed user ${userId} from onlineUsers`);
            break;
          }
        }
      });

});
