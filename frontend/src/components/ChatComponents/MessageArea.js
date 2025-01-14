import React, { useState,useEffect } from "react";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../../Context/ChatProvider.js";
import io from "socket.io-client";
import axios from 'axios'

const ENDPOINT = "http://localhost:8080";
var socket;
let selectedChatCompare;

const MessageArea = ({ messages,read,unread }) => {
  const { user,selectedChat } = ChatState();
  const [showDiv, setShowDiv] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [delmsg, setDelmsg] = useState([]);
  const [lastDelMsg,setLastDelMsg]=useState();

  const isSameSender = (messages, m, i, userId) => {
    return (
      i < messages.length - 1 &&
      messages[i + 1].sender._id === m.sender._id &&
      messages[i].sender._id !== userId
    );
  };

  const isLastMessage = (messages, i, userId) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender._id !== userId &&
      messages[messages.length - 1].sender._id
    );
  };

 
  
  const handleRightClick = (e, mid) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setShowDiv(mid);
  };

  const handleDelete = async (m) => {
    console.log(m);
    console.log(user.userExists._id);
    if(user.userExists._id!==m.sender._id){
      setShowDiv(false);
      alert("Not authorised to delete this msg!!");
      return;
    }
    setDelmsg([...delmsg,m._id]);
    setShowDiv(false);
    setLastDelMsg(m._id);
    socket.emit("deleteMessage", m._id);
  };
  


  const isRead = (m) =>{
    if(read.length===0 || !read){
      return false;
    }
    const a = messages.find((msg)=>msg._id===m._id);
    if(a)return true;
    console.log(m._id,a);
    return false;
  }

  const notDel=(m)=>{
    const user=(delmsg.find((mId)=>mId===m));
    if(!user)return true;
    return false;
  }

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("deleteMessage", lastDelMsg);
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => {
          const isCurrentSenderLoggedInUser =
            m.sender._id === user.userExists._id;
          const shouldDisplayAvatar =
            (!isSameSender(messages, m, i, user.userExists._id) &&
              !isCurrentSenderLoggedInUser) ||
            isLastMessage(messages, i, user.userExists._id);

          return (
            <div
              key={m._id}
              style={{
                display: "flex",
                justifyContent: isCurrentSenderLoggedInUser
                  ? "flex-end"
                  : "flex-start",
                marginTop: "5px",
                marginBottom: "5px",
                marginRight: "5px",
                zIndex:1,
              }}
            >
              {shouldDisplayAvatar && notDel(m._id) && (
                <img
                  src={m.sender.pic}
                  className="rounded-circle"
                  style={{ width: "50px", marginRight: "5px" }}
                  alt="Avatar"
                />
              )}
              {showDiv == m._id && (
                <div
                  style={{
                    top: pos.x,
                    left: pos.y,
                    backgroundColor: "wheat",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span>Are you sure want to delete this message?</span>
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <button onClick={()=>handleDelete(m)}>YES</button>
                    <button
                      onClick={() => {
                        setShowDiv(false);
                      }}
                    >
                      NO
                    </button>
                  </div>
                </div>
              )}
              {notDel(m._id) && (
                <span
                  style={{
                    backgroundColor: isCurrentSenderLoggedInUser
                      ? "#BEE3F8"
                      : "#B9F5D0",
                    borderRadius: "20px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                    marginLeft: `${
                      !isCurrentSenderLoggedInUser && !shouldDisplayAvatar
                        ? "55px"
                        : "0px"
                    }`,
                    display:'flex',
                    flexDirection:'row'
                  }}
                  onContextMenu={(e) => handleRightClick(e, m._id)}
                >
                  {m.content}
                  {
                    isCurrentSenderLoggedInUser && (isRead(m)?(<div><i className="fa-solid fa-check-double" style={{color:'black',fontSize:'20px'}}></i></div>):(<div><i className="fa-solid fa-check" style={{color:'black',fontSize:'20px'}}></i></div>))
                  }
                </span>
              )}
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default MessageArea;
