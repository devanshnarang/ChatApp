import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../../Context/ChatProvider";

const MessageArea = ({ messages }) => {
  const { user } = ChatState();

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
            <div key={m._id} style={{ display:'flex',justifyContent:isCurrentSenderLoggedInUser?'flex-end':'flex-start',marginTop:'5px',marginBottom:'5px' }}>
              {shouldDisplayAvatar && (
                <img
                  src={m.sender.pic}
                  className="rounded-circle"
                  style={{ width: "50px", marginRight: "5px" }}
                  alt="Avatar"
                />
              )}
              <span
                style={{
                  backgroundColor: isCurrentSenderLoggedInUser
                    ? "#BEE3F8"
                    : "#B9F5D0",
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                  marginLeft:`${(!isCurrentSenderLoggedInUser && !shouldDisplayAvatar)?'55px':'0px'}`
                }}
              >
                {m.content}
              </span>
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default MessageArea;
