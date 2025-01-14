import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider.js";
import Profile from "./Profile.js";
import GroupProfile from "./GroupProfile.js";
import axios from "axios";
import MessageArea from "./MessageArea.js";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:8080";
var socket;
let selectedChatCompare;

const ChatArea = ({ fetchagain, setFetchagain }) => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    showgroupchatModal,
    setShowgroupchatModal,
  } = ChatState();
  const [sender, setSender] = useState();
  const [messages, setMessages] = useState([]);
  const [newmessage, setNewmessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [groupsender, setGroupSender] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userToDisplay, setUserToDisplay] = useState();
  const [showgroupModal, setShowgroupModal] = useState(false);
  const [readmsgs,setReadmsgs]=useState([]);
  const [unreadmsgs,setUnreadmsgs]=useState([]);

  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const openGroupModal = () => {
    setShowgroupModal(true);
  };
  const closeGroupModal = () => setShowgroupModal(false);

  const getSender = (selectedChat) => {
    if (!selectedChat || !selectedChat.users) return;
    const a =
      selectedChat.users[0]._id === user._id
        ? selectedChat.users[0]
        : selectedChat.users[1];
    setSender(a);
  };

  const getGroupSender = (selectedChat) => {
    if (!selectedChat || !selectedChat.users) return;
    setGroupSender(selectedChat.users);
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      const readMessages = data.filter((message) => message.isRead);
      const unreadMessages = data.filter((message) => !message.isRead);
      setReadmsgs(readMessages);
      setUnreadmsgs(unreadMessages);
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log(error);
      alert("Can't fetch messages, try again!!");
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newmessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewmessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newmessage,
            chatId: selectedChat._id,
            isRead: false,
          },
          config
        );
        socket.emit("new message", data);
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        console.log(error);
        alert("Try sending message again!!");
      }
    }
  };

  // const markMessagesAsRead = async () => {
  //   if (!selectedChat || !messages) return;
    
  //   try {
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     };
      
  //     const updatedReadmsgs = messages?.filter(
  //       (m) => !m.isRead && m.sender._id !== user.userExists._id
  //     ) || [];
      
  
  //     if(updatedReadmsgs.length>0){
  //       await axios.patch(`/api/message/${selectedChat._id}/read`, {messageIds:updatedReadmsgs.map((msg)=>msg._id)}, config);
  //       setMessages((prevMessages) =>
  //         prevMessages.map((message) => ({
  //           ...message,
  //           isRead: true, 
  //         }))
  //       );
  //     }
  //     else return;
  
  //   } catch (error) {
  //     console.log(error);
  //     alert("Error marking messages as read!");
  //   }
  // };

  const handleMessage = (e) => {
    setNewmessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDifference = timeNow - lastTypingTime;
      if (timeDifference >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    if (!socketConnected || !selectedChat) return;
    
    const a = selectedChat 
      ? (selectedChat.users[0]._id === user.userExists._id 
         ? selectedChat.users[1]._id 
         : selectedChat.users[0]._id) 
      : null;
    
    // Emit message-read only when the chat is selected and socket is connected
    if (a && socketConnected) {
      socket.emit("message-read", {
        loggedUser: user.userExists._id,
        senderUser: a,
        chatId: selectedChat._id,
      });
    } else {
      console.error("Socket is not initialized or connected");
    }
  
    // Handle chat initialization
    const initializeChat = async () => {
      if (selectedChat.isGroupChat) {
        getGroupSender(selectedChat);
      } else {
        getSender(selectedChat);
        const a =
          selectedChat.users[0]._id === user.userExists._id
            ? selectedChat.users[1]
            : selectedChat.users[0];
        setUserToDisplay(a);
        fetchMessages();  // Fetch messages only after socket connection
      }
      selectedChatCompare = selectedChat;
    };
  
    initializeChat();
  }, [selectedChat, socketConnected]); // Ensure to re-run only when chat or socket connection changes
  

  // useEffect(() => {
  //   markMessagesAsRead();
  // }, [messages]);
  
  

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user.userExists);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    socket.on("connect", () => {
      console.log("NARANG CONNECTED");
    });
    socket.on("senderDoubleTick", (updatedMessages) => {
      console.log("Received updated messages:", updatedMessages);

      setMessages((prevMessages) => 
          prevMessages.map((msg) => {
              // Find the updated message and merge it with the previous message
              const updatedMessage = updatedMessages.find((m) => m._id === msg._id);
              if (updatedMessage) {
                  return { ...msg, isRead: updatedMessage.isRead };
              }
              return msg;
          })
      );
  });
  }, []);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        selectedChatCompare &&
        selectedChatCompare._id === newMessageReceived.chat._id
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });
  }, [selectedChatCompare]);

  return (
    <>
      <div
        className="w-full d-flex flex-column"
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          zIndex: showgroupchatModal ? 1 : -1,
        }}
      >
        {/* Header */}
        <div
          className="d-flex flex-row justify-content-center align-items-center"
          style={{
            backgroundColor: "red",
            position: "sticky",
            top: 0,
            zIndex: 1,
            boxSizing: "border-box",
            height: "8vh",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
          }}
        >
          <button
              style={{
                backgroundColor: "wheat",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                marginLeft:'5px'
              }}
              onClick={() => {
                setShowgroupchatModal(false);
                setSelectedChat("");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                className="bi bi-arrow-left-square-fill"
                viewBox="0 0 16 16"
              >
                <path d="M16 14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2zm-4.5-6.5H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H11.5a.5.5 0 0 0 0-1" />
              </svg>
            </button>
          <div
            style={{
              marginTop: "2px",
              marginRight: "20px",
              marginLeft: "8px",
              width: "90%",
              fontSize: "28px",
              fontWeight: "bold",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
          >
            
            <div
              style={{
                marginRight: "5px",
                display: "flex",
                flexDirection: "row",
              }}
            >
              {selectedChat?.isGroupChat ? (
                <div></div>
              ) : (
                <div>
                  <button
                    onClick={openModal}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0px",
                      marginLeft: "2px",
                      marginRight: "0px",
                    }}
                  >
                    <img
                      src={
                        selectedChat?.users?.[0]?._id === user.userExists._id
                          ? selectedChat?.users?.[1]?.pic
                          : selectedChat?.users?.[0]?.pic
                      }
                      style={{
                        borderRadius: "50%",
                        height: "50px",
                        width: "50px",
                        marginRight: "10px",
                      }}
                    />
                  </button>
                </div>
              )}
            </div>
            {selectedChat?.isGroupChat ? (
              <div>{selectedChat?.chatName}</div>
            ) : (
              <div style={{ padding: "0px" }}>
                {selectedChat?.users?.[0]?._id === user.userExists._id
                  ? selectedChat?.users?.[1]?.name
                  : selectedChat?.users?.[0]?.name}
              </div>
            )}
          </div>
          {selectedChat?.isGroupChat ? (
            <button onClick={openGroupModal} style={{margin:'10px'}}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-eye-fill"
                viewBox="0 0 16 16"
              >
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
              </svg>
            </button>
          ) : (
            <div></div>
          )}
        </div>

        {/* Messages Section */}
        <div
          className="messages"
          style={{
            flex: 1,
            overflowY: "auto",
            width: "100%", // Ensures it occupies full width
            paddingBottom: "70px", // Matches input box height
            marginBottom: "25px", // Prevents overlap
            height: "72vh",
            zIndex: 1,
            backgroundColor: "wheat",
          }}
        >
          <MessageArea messages={messages} read={readmsgs} unread={unreadmsgs} />
        </div>

        {/* Input Box */}
        <div
          style={{
            position: "sticky",
            bottom: "0",
            width: "100%",
            zIndex: 2,
            padding: "5px",
            boxSizing: "border-box",
            height: "6vh",
            padding: "4px",
            backgroundColor: "green",
          }}
        >
          <input
            style={{
              height: "50px", // Matches design
              width: "100%",
              border: "none",
              boxSizing: "border-box", // Prevents width overflow
              marginBottom: "5px",
            }}
            placeholder="Enter the message..."
            onKeyDown={sendMessage}
            onChange={handleMessage}
            value={newmessage}
          />
        </div>
      </div>

      <GroupProfile
        showModal={showgroupModal}
        closeModal={closeGroupModal}
        users={groupsender}
        setUsers={setGroupSender}
        fetchagain={fetchagain}
        setFetchagain={setFetchagain}
        fetchMessages={fetchMessages}
      />
      <Profile
        showModal={showModal}
        closeModal={closeModal}
        user={userToDisplay}
      />
    </>
  );
};

export default ChatArea;
