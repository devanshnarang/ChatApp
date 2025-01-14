import { useState, useEffect } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider.js";
import GroupChatModal from "./GroupChatModal.js";
import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:8080";
var socket;

const AllContacts = ({ fetchagain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { user, selectedChat, setSelectedChat, chats, setChats,showgroupchatModal,setShowgroupchatModal } = ChatState();
  const [showDiv, setShowDiv] = useState();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [delChats, setDelChats] = useState([]);
  const [lastDelChat, setLastDelChat] = useState();
  const [unreadCounts, setUnreadCounts] = useState({});

  const openModal = () => setShowgroupchatModal(true);
  const closeModal = () => setShowgroupchatModal(false);

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data.chats);
      return;
    } catch (error) {
      alert("Failed to fetch your Chats. Try again!!");
      return;
    }
  };

  const getSender = (users) => {
    if (loggedUser) {
      return users[0]._id === loggedUser.userExists._id ? users[1] : users[0];
    }
    return null;
  };

  const handleRightClick = (e, chat) => {
    e.preventDefault();
    setPos({ x: e.eventX, y: e.eventY });
    setShowDiv(chat._id);
  };

  const handleDelete = (chat) => {
    const a = chat.users.find((u) => u._id === user.userExists._id);
    setDelChats([...delChats, chat]);
    setLastDelChat(chat._id);
    setShowDiv(false);
    socket.emit("deleteChat", chat._id);
  };

  const found = (chat) => {
    const a = delChats.find((e) => e._id === chat._id);
    if (a) {
      return true;
    }
    return false;
  };

  const fetchMessagesForAllChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
  
      for (const chat of chats) {
        const { data } = await axios.get(`/api/message/${chat._id}`, config);
        const unreadMessages = data.filter((message) => 
          !message.isRead && message.sender._id!==user.userExists._id
      );
        setUnreadCounts((prev) => ({ ...prev, [chat._id]: unreadMessages }));
  
        setUnreadCounts((prev) => ({
          ...prev,
          [chat._id]: unreadMessages.length,
        }));
      }
    } catch (error) {
      console.log(error);
      alert("Can't fetch messages, try again!!");
    }
  };

  useEffect(() => {
    const x = localStorage.getItem("userInfo");
    if (x) {
      setLoggedUser(JSON.parse(x));
      fetchChats();
    }
  }, [fetchagain]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      fetchMessagesForAllChats();
    }
  }, [chats, user.token]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("deleteChat", lastDelChat);
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <div
        className="contacts-container"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100vh",
          boxSizing: "border-box",
          marginTop: "-30px",
          zIndex: 1,
        }}
      >
        {user && (
          <div
            className="contacts-box"
            style={{
              border: "10px",
              borderColor: "black",
              flex: "1",
              display: "flex",
              flexDirection: "column",
              padding: "10px",
            }}
          >
            {/* Fixed Header with button */}
            <div
              className="d-flex justify-content-start"
              style={{
                position: "sticky",
                top: "0",
                backgroundColor: "white",
                zIndex: "3", // Positive z-index to ensure header is interactive
                padding: "10px",
                boxSizing: "border-box",
                height: "10vh",
              }}
            >
              <h3>My Chats</h3>
              
            </div>

            {/* Chat list */}
            <div
              className="d-flex flex-column"
              style={{
                padding: "10px",
                boxSizing: "border-box",
                zIndex: "2", // Ensure the chat list is above the background
                marginTop: "30px",
                padding: "10px",
                border: "3px solid black",
                height: "75vh",
              }}
            >
              {chats.map((chat) => {
                if (!found(chat)) {
                  return (
                    <div
                      key={chat._id}
                      style={{
                        overflowY: "auto", // Only the chat list should be scrollable
                        backgroundColor: "greenyellow",
                        color: "red",
                        padding: "10px",
                        margin: "5px 0",
                        borderRadius: "5px",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        display:'flex',
                        flexDirection:'row'
                      }}
                      onClick={() => {
                        setSelectedChat(chat);
                        setShowgroupchatModal(false);
                      }}
                      onContextMenu={(e) => handleRightClick(e, chat)}
                    >
                      <h5
                        style={{
                          margin: "0px",
                          height: "40px",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          fontWeight: "bold",
                          fontSize: "x-large",
                        }}
                      >
                        {(!chat.isGroupChat && getSender(chat.users)?.pic) ||
                        chat.isGroupChat ? (
                          <img
                            src={
                              chat.isGroupChat
                                ? "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" // Placeholder for group chats
                                : getSender(chat.users)?.pic
                            }
                            alt={
                              chat.isGroupChat
                                ? chat.chatName
                                : getSender(chat.users)?.name
                            }
                            style={{
                              borderRadius: "50%",
                              height: "50px",
                              width: "50px",
                              marginRight: "10px",
                            }}
                          />
                        ) : null}

                        {!chat.isGroupChat
                          ? getSender(chat.users)?.name
                          : chat.chatName}
                      </h5>
                    {unreadCounts[chat._id] > 0 && (
                          <div
                            style={{
                              backgroundColor: "red",
                              color: "white",
                              borderRadius: "50%",
                              padding: "5px",
                              marginLeft: "10px",
                              width:'40px',
                              height:'40px',
                              display:'flex',
                              alignItems:'center',
                              justifyContent:'center'
                            }}
                          >
                            {unreadCounts[chat._id]}
                          </div>
                        )}

                      {showDiv === chat._id && (
                        <div
                          style={{
                            position: "absolute", // Ensure context menu appears at correct position
                            top: pos.y,
                            left: pos.x,
                            backgroundColor: "wheat",
                            display: "flex",
                            flexDirection: "column",
                            padding: "10px",
                            borderRadius: "5px",
                            boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <span>
                            Are you sure you want to delete this chat?
                          </span>
                          <div
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <button onClick={() => handleDelete(chat)}>
                              YES
                            </button>
                            <button
                              onClick={() => {
                                setShowDiv(null); // Close the context menu
                              }}
                            >
                              NO
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null; // Return null if the chat is found
              })}
            </div>
          </div>
        )}
      </div>
      <GroupChatModal closeModal={closeModal} />
    </>
  );
};

export default AllContacts;
