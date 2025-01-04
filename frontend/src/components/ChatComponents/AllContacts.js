import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import GroupChatModal from "./GroupChatModal";

const AllContacts = ({ fetchagain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

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
      alert("Failed to fetch your Chats. Try again!! ");
      return;
    }
  };

  const getSender = (users) => {
    console.log(users);
    if (loggedUser) {
      return users[0]._id === loggedUser.userExists._id ? users[1] : users[0];
    }
    return;
  };

  useEffect(() => {
    console.log("Called in All contacts!!");
    const x = localStorage.getItem("userInfo");
    if (x) {
      setLoggedUser(JSON.parse(x));
      fetchChats();
    }
  }, [fetchagain]);

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
        }}
      >
        {user && (
          <div className="contacts-box" style={{ flex: "1", display: "flex", flexDirection: "column" }}>
            {/* Fixed Header with button */}
            <div
              className="d-flex justify-content-start"
              style={{
                position: "sticky",
                top: "0",
                backgroundColor: "white",
                zIndex: "1000",
                padding: "10px",
                boxSizing: "border-box",
              }}
            >
              <h3>My Chats</h3>
              <button
                onClick={openModal}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  backgroundColor: "green",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                New Groupchat +
              </button>
            </div>

            {/* Chat list */}
            <div
              className="d-flex flex-column"
              style={{
                overflowY: "auto", // Only the chat list should be scrollable
                flex: 1,
                padding: "10px",
                boxSizing: "border-box",
              }}
            >
              {chats.map((chat) => (
                <div
                  style={{
                    backgroundColor: "greenyellow",
                    color: "red",
                    padding: "10px",
                    margin: "5px 0",
                    borderRadius: "5px",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                >
                  <h5 style={{ margin: "0px" }}>
                    {!chat.isGroupChat
                      ? getSender(chat.users)?.email
                      : chat.chatName}
                  </h5>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <GroupChatModal showModal={showModal} closeModal={closeModal} />
    </>
  );
};

export default AllContacts;
