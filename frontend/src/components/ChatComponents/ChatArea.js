import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import Profile from "./Profile";
import GroupProfile from "./GroupProfile";
import axios from "axios";
import MessageArea from "./MessageArea";
import io from "socket.io-client";
import {Lottie} from 'react-lottie';

const ENDPOINT = "http://localhost:8080";
var socket;
let selectedChatCompare;

const ChatArea = ({ fetchagain, setFetchagain }) => {
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [showModal, setShowModal] = useState(false);
  const [sender, setSender] = useState();
  const [messages, setMessages] = useState([]);
  const [newmessage, setNewmessage] = useState("");
  const [showgroupModal, setShowgroupModal] = useState(false);
  const [groupsender, setGroupSender] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const openGroupModal = () => setShowgroupModal(true);
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
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
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
          },
          config
        );
        socket.emit("new message", data);
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        alert("Try sending message again!!");
      }
    }
  };

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
    if (selectedChat) {
      if (selectedChat.isGroupChat) {
        getGroupSender(selectedChat);
      } else {
        getSender(selectedChat);
      }
      selectedChatCompare = selectedChat;
      fetchMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user.userExists);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    return () => {
      socket.disconnect();
    };
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

    return () => {
      socket.off("message received");
    };
  }, [selectedChatCompare]);

  return (
    <>
      <div
        className="w-full d-flex flex-column"
        style={{ backgroundColor: "wheat" }}
      >
        <div
          className="d-flex flex-row justify-content-center align-items-center"
          style={{ height: "60px", backgroundColor: "whitesmoke" }}
        >
          <div
            className="d-flex flex-row"
            style={{
              marginTop: "2px",
              marginRight: "20px",
              marginLeft: "5px",
              width: "90%",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            <div style={{ marginRight: "10px" }}>
              <button
                style={{ backgroundColor: "wheat" }}
                onClick={() => {
                  if (alert("Do you want to go back and deselect this chat?")) {
                    setSelectedChat("");
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  fill="currentColor"
                  className="bi bi-arrow-left-square-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2zm-4.5-6.5H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H11.5a.5.5 0 0 0 0-1" />
                </svg>
              </button>
            </div>
            {selectedChat?.isGroupChat ? (
              <div>{selectedChat?.chatName}</div>
            ) : (
              <div>
                {selectedChat?.users?.[0]?._id === user.userExists._id
                  ? selectedChat?.users?.[1]?.name
                  : selectedChat?.users?.[0]?.name}
              </div>
            )}
          </div>
          <button onClick={openGroupModal}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-eye-fill"
              viewBox="0 0 16 16"
            >
              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
            </svg>
          </button>
        </div>
        <div className="messages" style={{ height: "75vh" }}>
          <MessageArea messages={messages} />
        </div>
        <div>
          {isTyping ? (
            <div>
              <Lottie options={defaultOptions}
              width={70} style={{marginBottom:15,marginLeft:0}}/>
            </div>
          ) : (
            <div></div>
          )}
          <input
            style={{ height: "7vh", width: "100%" }}
            placeholder="Enter the message..."
            onKeyDown={sendMessage}
            onChange={handleMessage}
            value={newmessage}
          />
        </div>
      </div>
      <Profile showModal={showModal} closeModal={closeModal} user={sender} />
      <GroupProfile
        showModal={showgroupModal}
        closeModal={closeGroupModal}
        users={groupsender}
        setUsers={setGroupSender}
        fetchagain={fetchagain}
        setFetchagain={setFetchagain}
        fetchMessages={fetchMessages}
      />
    </>
  );
};

export default ChatArea;
