import React, { useEffect, useState, useRef } from "react";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../../Context/ChatProvider.js";
import { decryptMessage } from "../EncryptionDecryption/DecryptMessage.js";

const MessageArea = ({ messages, setMessages, read, unread, socket }) => {
  const { user } = ChatState();
  const [showDiv, setShowDiv] = useState(null);
  const [delmsg, setDelmsg] = useState([]);
  const messageRefs = useRef({});
  const [decryptedMessages, setDecryptedMessages] = useState({});

  // State to control vertical position of confirmation modal
  const [modalVerticalPosition, setModalVerticalPosition] = useState("top");

  // Ref for the scrollable container
  const feedContainerRef = useRef(null);

  // Decrypt message function
  const decryptMessageContent = async (m) => {
    try {
      let decrypted;
      try {
        if (m.sender._id === user.userExists._id) {
          decrypted = await decryptMessage(
            m.tocontent,
            localStorage.getItem("privateKey")
          );
        } else {
          decrypted = await decryptMessage(
            m.fromcontent,
            localStorage.getItem("privateKey")
          );
        }
      } catch (error) {
        decrypted = "";
      }
      setDecryptedMessages((prev) => ({
        ...prev,
        [m._id]: decrypted || "",
      }));
    } catch (error) {
      console.error("Error decrypting message:", error);
    }
  };

  useEffect(() => {
    messages.forEach((m) => {
      decryptMessageContent(m);
    });
  }, [messages, user.userExists.privateKey]);

  // Automatically scroll to bottom when messages update
  useEffect(() => {
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTop = feedContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const isRead = (m) => read.some((msg) => msg._id === m._id);
  const notDel = (m) => !delmsg.includes(m._id);

  const handleRightClick = (e, m) => {
    e.preventDefault();
    setShowDiv(m._id);
    const rect = e.currentTarget.getBoundingClientRect();
    if (window.innerHeight - rect.bottom < 120) {
      setModalVerticalPosition("bottom");
    } else {
      setModalVerticalPosition("top");
    }
  };

  const handleDelete = (m) => {
    if (user.userExists._id !== m.sender._id) {
      alert("Not authorized to delete this message!");
      return;
    }
    setDelmsg((prev) => [...prev, m._id]);
    setShowDiv(null);
    socket.emit("deleteMessage", m._id);
  };

  return (
    // The outer div now takes 100% height of its parent.
    <div ref={feedContainerRef} style={{ height: "100%", overflowX: "hidden",marginBottom:"50px" }}>
      <ScrollableFeed>
        {messages &&
          messages.map((m) => {
            const isCurrentSender = m.sender._id === user.userExists._id;
            const messageContent = decryptedMessages[m._id] || "";

            return (
              <div
                key={m._id}
                style={{
                  display: "flex",
                  justifyContent: isCurrentSender ? "flex-end" : "flex-start",
                  margin: "5px",
                  position: "relative",
                }}
              >
                {messageContent && (
                  <span
                    ref={(el) => (messageRefs.current[m._id] = el)}
                    style={{
                      backgroundColor: isCurrentSender ? "#BEE3F8" : "#B9F5D0",
                      borderRadius: "12px",
                      padding: "10px 15px",
                      paddingRight: "40px", // Reserve space for tick icons
                      maxWidth: "60%",
                      wordBreak: "break-word",
                      display: "inline-block",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    onContextMenu={(e) => handleRightClick(e, m)}
                  >
                    {messageContent}
                    {isCurrentSender && (
                      <i
                        className={
                          isRead(m) ? "fa-solid fa-check-double" : "fa-solid fa-check"
                        }
                        style={{
                          color: "black",
                          fontSize: "16px",
                          position: "absolute",
                          bottom: "5px",
                          right: "10px",
                        }}
                      ></i>
                    )}
                    {showDiv === m._id && (
                      <div
                        style={{
                          position: "absolute",
                          ...(modalVerticalPosition === "top"
                            ? { top: "0" }
                            : { bottom: "0" }),
                          left: "-220px",
                          backgroundColor: "white",
                          padding: "10px",
                          borderRadius: "8px",
                          boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                          zIndex: 1000,
                          width: "200px",
                        }}
                      >
                        <span
                          style={{
                            marginBottom: "8px",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                        >
                          Delete this message?
                        </span>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleDelete(m)}
                            style={{
                              backgroundColor: "#ff4d4d",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setShowDiv(null)}
                            style={{
                              backgroundColor: "#ccc",
                              color: "black",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </span>
                )}
              </div>
            );
          })}
      </ScrollableFeed>
    </div>
  );
};

export default MessageArea;
