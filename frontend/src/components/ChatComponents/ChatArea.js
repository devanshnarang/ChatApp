import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider.js";
import Profile from "./Profile.js";
import GroupProfile from "./GroupProfile.js";
import axios from "axios";
import MessageArea from "./MessageArea.js";
import { encryptMessage } from "../EncryptionDecryption/EncrpytMessage.js";
import { decryptMessage } from "../EncryptionDecryption/DecryptMessage.js";

let selectedChatCompare;

const ChatArea = ({ fetchagain, setFetchagain }) => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    showgroupchatModal,
    setShowgroupchatModal,
    messages,
    setMessages,
    socket
  } = ChatState();

  const [sender, setSender] = useState();
  const [newmessage, setNewmessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [groupsender, setGroupSender] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userToDisplay, setUserToDisplay] = useState();
  const [showgroupModal, setShowgroupModal] = useState(false);
  const [readmsgs, setReadmsgs] = useState([]);
  const [unreadmsgs, setUnreadmsgs] = useState([]);

  // NEW: Responsive state for mobile screens.
  // If the window width is less than 768px, consider it mobile.
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define responsive back button size:
  // Mobile: 35px, Tablet: 40px, Desktop: 50px.
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isTablet = windowWidth >= 576 && windowWidth < 768;
  const backButtonSize = isMobile ? "35px" : isTablet ? "40px" : "50px";

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
      selectedChat.users[0]._id === user.userExists._id
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
      // const { data } = await axios.get(`https://chatapp-5os8.onrender.com/api/message/${selectedChat._id}`, config);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      const readMessages = data.filter((message) => message.isRead);
      const unreadMessages = data.filter((message) => !message.isRead);
      setReadmsgs(readMessages);
      setUnreadmsgs(unreadMessages);
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newmessage) {
      // Stop the typing indicator for the current chat
      socket.emit("stop typing", selectedChat._id);
  
      try {
        // Common config for all axios requests
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
  
        // Check if the current chat is a group chat
        if (selectedChat.isGroupChat) {
          // For group chats, encrypt the message for each group member
          const encryptedMessages = await Promise.all(
            selectedChat.users.map(async (groupUser) => {
              // Retrieve the public key for each group user
              const { data: pubKeyData } = await axios.post(
                "/api/user/getting-public-key",
                { id: groupUser._id },
                config
              );
              // Encrypt the message using the user's public key
              const encryptedMessage = await encryptMessage(newmessage, pubKeyData.publicKey);
              const { data } = await axios.post(
                "/api/message",
                {
                  from: encryptedMessage, // Array of { userId, encryptedMessage }
                  tocontent: encryptedMessage,
                  chatId: selectedChat._id,
                  isRead: false,
                },
                config
              );
              socket.emit("new message", data);
              setMessages((prevMessages) => [...prevMessages, data]);
              return { userId: groupUser._id, encryptedMessage };
            })
          );
  
          // Clear the message input
          setNewmessage("");
  
          // Post the group message with the encrypted messages for all users.
          // The backend should expect a field like `groupContents` for group messages.
          
          // Notify others via socket and update your local messages
        } else {
          // One-on-one chat logic
          // Determine who is the receiver and who is the sender.
          // Assumes a one-on-one chat will have exactly two users.
          const receiver =
            selectedChat.users[0]._id === user.userExists._id
              ? selectedChat.users[1]
              : selectedChat.users[0];
          const senderMy =
            selectedChat.users[0]._id === user.userExists._id
              ? selectedChat.users[0]
              : selectedChat.users[1];
  
          // Get the public key for the sender (for storing the sender’s encrypted version)
          const { data: senderPubKeyData } = await axios.post(
            "/api/user/getting-public-key",
            { id: senderMy._id },
            config
          );
          // Get the public key for the receiver
          const { data: receiverPubKeyData } = await axios.post(
            "/api/user/getting-public-key",
            { id: receiver._id },
            config
          );
  
          // Encrypt the message separately for sender and receiver
          const encryptmsgSender = await encryptMessage(newmessage, senderPubKeyData.publicKey);
          const encryptmsgReceiver = await encryptMessage(newmessage, receiverPubKeyData.publicKey);
  
          // Clear the message input
          setNewmessage("");
  
          // Post the one-on-one message with both encrypted contents.
          const { data } = await axios.post(
            "/api/message",
            {
              fromcontent: encryptmsgSender, // Sender’s copy
              tocontent: encryptmsgReceiver,   // Receiver’s copy
              chatId: selectedChat._id,
              isRead: false,
            },
            config
          );
          // Notify others via socket and update your local messages
          socket.emit("new message", data);
          setMessages((prevMessages) => [...prevMessages, data]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Try sending message again!!");
      }
    }
  };
  

  const handleMessage = (e) => {
    setNewmessage(e.target.value);
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
    if (!socket || !selectedChat) return;
    if (selectedChat && selectedChat.isGroupChat) {
      // Group chat logic (if any) can go here
      fetchMessages();
    } else {
      const a = selectedChat
        ? selectedChat.users[0]._id === user.userExists._id
          ? selectedChat.users[1]._id
          : selectedChat.users[0]._id
        : null;
      if (a && socket) {
        socket.emit("message-read", {
          loggedUser: user.userExists._id,
          senderUser: a,
          chatId: selectedChat._id,
        });
      } else {
        console.error("Socket is not initialized or connected");
      }

      const initializeChat = async () => {
        if (selectedChat && selectedChat.isGroupChat) {
          getGroupSender(selectedChat);
          fetchMessages();
        } else {
          getSender(selectedChat);
          const a =
            selectedChat.users[0]._id === user.userExists._id
              ? selectedChat.users[1]
              : selectedChat.users[0];
          setUserToDisplay(a);
          fetchMessages();
        }
        selectedChatCompare = selectedChat;
      };

      initializeChat();
    }
  }, [selectedChat, socket]);

  useEffect(() => {
    setMessages((prevMessages) => {
      const messageIds = new Set(prevMessages.map((m) => m._id));
      const uniqueMessages = messages.filter((m) => !messageIds.has(m._id));

      const a = selectedChat
        ? selectedChat.users[0]._id === user.userExists._id
          ? selectedChat.users[1]._id
          : selectedChat.users[0]._id
        : null;

      if (a && socket) {
        socket.emit("message-read", {
          loggedUser: user.userExists._id,
          senderUser: a,
          chatId: selectedChat._id,
        });
      } else {
        console.error("Socket is not initialized or connected");
      }
      if (uniqueMessages.length > 0) {
        return [...prevMessages, ...uniqueMessages];
      }
      return prevMessages;
    });

    if (messages.length > 0) {
      const readMessages = messages.filter((message) => message.isRead);
      const unreadMessages = messages.filter((message) => !message.isRead);
      setReadmsgs(readMessages);
      setUnreadmsgs(unreadMessages);
    }
  }, [messages]);

  useEffect(() => {
    const handleMessageReceived = (newMessageReceived) => {
      if (
        selectedChatCompare &&
        selectedChatCompare._id === newMessageReceived.chat._id
      ) {
        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some(
            (message) => message._id === newMessageReceived._id
          );
          return isDuplicate ? prevMessages : [...prevMessages, newMessageReceived];
        });
      }
    };

    const handleConnected = () => console.log("Connected");
    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);
    const handleSenderDoubleTick = (updatedMessages) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          const updatedMessage = updatedMessages.find((m) => m._id === msg._id);
          return updatedMessage ? { ...msg, isRead: updatedMessage.isRead } : msg;
        })
      );
    };
    const handleMessageDeleted = (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    };

    socket.on("connected", handleConnected);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);
    socket.on("senderDoubleTick", handleSenderDoubleTick);
    socket.on("message received", handleMessageReceived);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("connected", handleConnected);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
      socket.off("senderDoubleTick", handleSenderDoubleTick);
      socket.off("message received", handleMessageReceived);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket]);

  return (
    <>
      <div
        className="w-full d-flex flex-column"
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          zIndex: showgroupchatModal ? 1 : -1,
          // backgroundColor: "black"
        }}
      >
        
        {/* Header */}
        <div
          className="d-flex flex-row justify-content-center align-items-center"
          style={{
            backgroundColor: "rgb(47,44,44)",
            position: "sticky",
            top: 0,
            zIndex: 1,
            boxSizing: "border-box",
            height: "9vh",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
          }}
        >
          <button
            style={{
              // backgroundColor: "wheat",
              borderRadius: "50%",
              width: isMobile ? "35px" : isTablet ? "40px" : "50px",
              height: isMobile ? "35px" : isTablet ? "40px" : "50px",
              marginLeft: "5px",
            }}
            onClick={() => {
              setShowgroupchatModal(false);
              setSelectedChat("");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
              backgroundColor: "rgb(47,44,44)",
            }}
          >
            <div
              style={{
                marginRight: "5px",
                display: "flex",
                flexDirection: "row",
                backgroundColor: "rgb(47,44,44)",
              }}
            >
              {selectedChat?.isGroupChat ? (
                <div></div>
              ) : (
                <div>
                  <button
                    onClick={openModal}
                    style={{
                      backgroundColor: "rgb(47,44,44)",                      border: "none",
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
              <div style={{backgroundColor: "rgb(47,44,44)",fontSize:"2rem"}}>{selectedChat?.chatName}</div>
            ) : (
              <div style={{ padding: "0px",backgroundColor: "rgb(47,44,44)",fontSize:"2rem" }}>
                {selectedChat?.users?.[0]?._id === user.userExists._id
                  ? selectedChat?.users?.[1]?.name
                  : selectedChat?.users?.[0]?.name}
              </div>
            )}
          </div>
          {selectedChat?.isGroupChat ? (
            <button onClick={openGroupModal} style={{ margin: "10px" }}>
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
            width: "100%",
            paddingBottom: "70px",
            marginBottom: "25px",
            height: "75vh",
            zIndex: 1,
            backgroundColor:"black"
          }}
        >
          <MessageArea
            messages={messages}
            setMessages={setMessages}
            read={readmsgs}
            unread={unreadmsgs}
            socket={socket}
          />
        </div>

        {/* Input Box */}
        <div
  style={{
    position: "sticky",      // use sticky as required
    bottom: 10,              // stick to the bottom of the parent container
    left: 0,
    width: "100%",
    zIndex: 2,
    backgroundColor: "green",
    padding: "4px",         // keep padding as needed
    boxSizing: "border-box",
    marginTop: "5px"
    // Do not set a fixed height here so that the container fits its content.
  }}
>
  <input
    style={{
      height: "50px",        // the height of the input field
      width: "100%",
      border: "none",
      boxSizing: "border-box",
      backgroundColor:"white",
      color:"black"
      // Removed any marginBottom that might push it out.
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
      <Profile showModal={showModal} closeModal={closeModal} user={userToDisplay} />
    </>
  );
};

export default ChatArea;
//RSA Algorithm
//DB-public_key,iv,salt
//private(encrpyted)=recovery_key+private_key+iv+salt
//recovery_key=uuidv4
//to decrpyt private_key      backup_key+iv+salt
