import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";

const ENDPOINT = "https://chatapp-5os8.onrender.com";

// const ENDPOINT = "http://localhost:8080";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState(null);
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [showgroupchatModal, setShowgroupchatModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(ENDPOINT,{ transports: ['websocket'] });
    setSocket(newSocket);
  
    // Clean up on unmount
    return () => newSocket.disconnect();
  }, []);
  

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    if (!userInfo) {
      navigate('/');
    }
  }, [navigate]);



  useEffect(() => {
    // Only create a new socket if there is a user and no active socket.
    if (user && (!socket || socket.disconnected)) {
      const newSocket = io(ENDPOINT,{ transports: ['websocket'] });
      setSocket(newSocket);
  
      newSocket.on("connect", () => {
        // console.log("Socket connected:", newSocket.id);
        newSocket.emit("setup", user.userExists);
        // console.log("Setup emitted with", user.userExists);
      });
  
      return () => newSocket.disconnect();
    }
    // We only need to run this effect when the user changes.
    // Do not include `socket` if that causes an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <ChatContext.Provider value={{
      user,
      setUser,
      selectedChat,
      setSelectedChat,
      chats,
      setChats,
      showgroupchatModal,
      setShowgroupchatModal,
      messages,
      setMessages,
      socket
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
