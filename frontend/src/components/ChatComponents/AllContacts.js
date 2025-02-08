import { useState, useEffect } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider.js";
import GroupChatModal from "./GroupChatModal.js";

const AllContacts = ({ fetchagain }) => {
  // Local state for the logged-in user (from localStorage)
  const [loggedUser, setLoggedUser] = useState();

  // Destructure context values from ChatState
  const { 
    user, 
    selectedChat, 
    setSelectedChat, 
    chats, 
    setChats, 
    showgroupchatModal, 
    setShowgroupchatModal, 
    socket, 
    messages, 
    setMessages 
  } = ChatState();

  // State to control the context menu for deletion
  const [showDiv, setShowDiv] = useState();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [delChats, setDelChats] = useState([]);
  const [lastDelChat, setLastDelChat] = useState();
  // State to hold unread counts (as an object keyed by chat._id)
  const [unreadCounts, setUnreadCounts] = useState({});

  // Modal open/close handlers for group chat modal
  const openModal = () => setShowgroupchatModal(true);
  const closeModal = () => setShowgroupchatModal(false);

  // --------------------------
  // API CALLS AND UTILITY FUNCTIONS
  // --------------------------

  // Fetch chats from API
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // const { data } = await axios.get("https://chatapp-5os8.onrender.com/api/chat", config);
      const { data } = await axios.get("/api/chat", config);
      setChats(data.chats);
      return;
    } catch (error) {
      alert("Failed to fetch your Chats. Try again!!");
      return;
    }
  };

  // Get the sender from a one-on-one chat using the loggedUser
  const getSender = (users) => {
    if (loggedUser) {
      return users[0]._id === loggedUser.userExists._id ? users[1] : users[0];
    }
    return null;
  };

  // Handle right-click (context menu) for chat deletion
  const handleRightClick = (e, chat) => {
    e.preventDefault();
    // Use eventX and eventY as provided (consider using clientX/clientY if needed)
    setPos({ x: e.eventX, y: e.eventY });
    setShowDiv(chat._id);
  };

  // Handle deletion of a chat from the UI and notify the server
  const handleDelete = (chat) => {
    const a = chat.users.find((u) => u._id === user.userExists._id);
    setSelectedChat(null);
    setDelChats([...delChats, chat]);
    setLastDelChat(chat._id);
    setShowDiv(false);
    socket.emit("deleteChat", chat._id);
  };

  // Check if a chat has already been marked for deletion
  const found = (chat) => {
    const a = delChats.find((e) => e._id === chat._id);
    if (a) {
      return true;
    }
    return false;
  };

  // For every chat, fetch messages and update unread counts
  const fetchMessagesForAllChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      for (const chat of chats) {
        // const { data } = await axios.get(`https://chatapp-5os8.onrender.com/api/message/${chat._id}`, config);
        const { data } = await axios.get(`/api/message/${chat._id}`, config);
        // First, update with the full array of unread messages (not used later)
        const unreadMessages = data.filter(
          (message) =>
            !message.isRead && message.sender._id !== user.userExists._id
        );
        setUnreadCounts((prev) => ({ ...prev, [chat._id]: unreadMessages }));

        // Then, update with just the count of unread messages
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
    fetchMessagesForAllChats();
  }, [socket]);

  useEffect(() => {
    if (chats.length > 0) {
      fetchMessagesForAllChats();
    }
  }, [chats, user.token]);

  useEffect(() => {
    const handleupdateForloggedUser = async (updatedMessages) => {
      try {
        console.log("Calling in updateForloggedUser socket");
        const newUnreadCounts = {};
        for (const chat of chats) {
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          // Fetch messages for the current chat
          // const { data } = await axios.get(`https://chatapp-5os8.onrender.com/api/message/${chat._id}`, config);
          const { data } = await axios.get(`/api/message/${chat._id}`, config);

          // Filter unread messages not sent by the logged-in user
          const unreadMessages = data.filter(
            (message) =>
              !message.isRead && message.sender._id !== user.userExists._id
          );
          newUnreadCounts[chat._id] = unreadMessages.length;
        }
        setUnreadCounts(newUnreadCounts);
      } catch (error) {
        console.error("Error updating unread count:", error);
      }
    };

    const handleupdateUnreadRedCount = async (newMessageReceived) => {
      try {
        console.log("updateUnreadRedCount event received:", newMessageReceived);
        fetchChats();
        fetchMessagesForAllChats();
        for (const chat of chats) {
          if (
            chat._id.toString() === newMessageReceived.chat._id.toString()
          ) {
            const config = {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            };
  
            // Fetch the latest messages for this chat
            // const { data } = await axios.get(
            //   `https://chatapp-5os8.onrender.com/api/message/${chat._id}`,
            //   config
            // );
            const { data } = await axios.get(
              `/api/message/${chat._id}`,
              config
            );
  
            // Filter unread messages not sent by the logged-in user
            const unreadMessages = data.filter(
              (message) =>
                !message.isRead &&
                message.sender._id.toString() !==
                  user.userExists._id.toString()
            );
            console.log(
              "Calling in updateUnreadRedCount socket, unread count:",
              unreadMessages.length
            );
  
            // Update the unread count for this chat
            setUnreadCounts((prev) => ({
              ...prev,
              [chat._id]: unreadMessages.length,
            }));
          }
        }
      } catch (error) {
        console.error("Error updating unread count:", error);
      }
    };

    //group chat=67a71
    //one-one=67a723
    const handleUpdateMyChats = async (data) => {
      fetchChats();
    };

    socket.emit("deleteChat", lastDelChat);

    // Listen for unread count updates from server for a single new message
    socket.on("updateUnreadRedCount", handleupdateUnreadRedCount);

    // Listen for a global update for the logged-in user to refresh unread counts
    socket.on("updateForloggedUser", handleupdateForloggedUser);

    socket.on("groupCreated", handleUpdateMyChats);
  }, [socket]);

  // --------------------------
  // JSX RETURN
  // --------------------------

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
          backgroundColor: "rgb(56,55,55)"
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
            {/* Fixed Header */}
            <div
              className="d-flex justify-content-start"
              style={{
                position: "sticky",
                top: "0",
                backgroundColor: "rgb(56,55,55)",
                zIndex: "3", // Ensure header is interactive
                padding: "10px",
                boxSizing: "border-box",
                height: "10vh",
              }}
            >
              <h3 style={{ color: "white", fontSize: "3rem",backgroundColor:"rgb(56,55,55)" }}>Chats</h3>
            </div>

            {/* Chat List */}
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
                backgroundColor:"rgb(56,55,55)"
              }}
            >
              {chats &&
                chats.map((chat) => {
                  if (!found(chat)) {
                    return [
                      <div
                        key={chat._id}
                        style={{
                          overflowY: "auto", // Only the chat list should be scrollable
                          color: "red",
                          padding: "10px",
                          margin: "5px 0",
                          borderRadius: "5px",
                          cursor: "pointer",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "row",
                          backgroundColor:"rgb(56,55,55)"
                        }}
                        onClick={() => {
                          setSelectedChat(chat);
                          // setShowgroupchatModal(false);
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
                            backgroundColor:"rgb(56,55,55)"
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
                        {!chat.isGroupChat && unreadCounts[chat._id] > 0 && (
                          <div
                            style={{
                              backgroundColor: "red",
                              color: "white",
                              borderRadius: "50%",
                              padding: "5px",
                              marginLeft: "10px",
                              width: "40px",
                              height: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {!chat.isGroupChat && unreadCounts[chat._id]}
                          </div>
                        )}

                        {showDiv === chat._id && (
                          <div
                            style={{
                              position: "absolute", // Context menu
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
                      </div>,
                      <hr
                        key={`${chat._id}-hr`}
                        style={{
                          border: "1px solid black",
                          height: "5px",
                          backgroundColor: "white",
                          width: "100%",
                        }}
                      />
                    ];
                  }
                  return null; // If chat is marked for deletion, return null
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
