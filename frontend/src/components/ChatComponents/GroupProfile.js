import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider.js";
import axios from "axios";

const GroupProfile = ({
  showModal,
  closeModal,
  users,
  setUsers,
  fetchagain,
  setFetchagain,
  fetchMessages,
}) => {
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [groupName, setGroupName] = useState("");
  const [userToAdd, setUserToAdd] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [resultLimit, setResultLimit] = useState(4); // Limit number of results shown

  const handleRemove = async (member) => {
    if (selectedChat?.groupAdmin._id !== user.userExists._id) {
      alert("Only Admin can remove a user!");
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.post(
        "https://chatapp-5os8.onrender.com/api/chat/groupremove",
        { chatId: selectedChat._id, userId: member._id },
        config
      );
      // If the removed user is the logged-in user, clear the selected chat.
      user._id === member._id ? setSelectedChat() : setSelectedChat(data);
      setSelectedChat(data.removed);
      setUsers(data.removed.users);
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRename = async (g) => {
    if (!g) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.put(
        "https://chatapp-5os8.onrender.com/api/chat/rename",
        { chatId: selectedChat._id, chatName: g },
        config
      );
      setSelectedChat(data);
      setFetchagain(!fetchagain);
      setGroupName("");
    } catch (error) {
      alert("Try Again!!");
    }
  };

  const handleSearch = async (e) => {
    const s = e.target.value;
    setUserToAdd(s);
    if (!s) {
      setSearchResult([]);
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.get(
        `https://chatapp-5os8.onrender.com/api/user?search=${s}`,
        config
      );
      setSearchResult(data);
    } catch (error) {
      alert("No user found with the given name!!");
    }
  };

  const handleAddUser = async (u) => {
    if (selectedChat?.users.find((t) => t._id === u._id)) {
      alert("User already in the group!!");
      return;
    }
    if (selectedChat?.groupAdmin._id !== user.userExists._id) {
      alert("Only Admin can add a user!!");
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.post(
        "https://chatapp-5os8.onrender.com/api/chat/groupAdd",
        { chatId: selectedChat._id, userId: u._id },
        config
      );
      setSelectedChat(data.added);
      setFetchagain(!fetchagain);
      setUsers(data.added.users);
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    if (!userToAdd) {
      setSearchResult([]);
    }
  }, [userToAdd]);

  return (
    <>
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 3, border: "5px solid white" }}
          ></div>
          {/* Modal */}
          <div
            className="modal fade show"
            tabIndex="-1"
            role="dialog"
            style={{ display: "block", zIndex: 3, border: "5px solid white" }}
            aria-labelledby="exampleModalCenterTitle"
            aria-hidden="false"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div
                className="modal-content"
                style={{
                  backgroundColor: "rgb(113,111,111)",
                  border: "5px solid white",
                  padding: "4px",
                }}
              >
                {/* Modal Header with Group Name and Group Members Grid */}
                <div
                  className="modal-header"
                  style={{
                    backgroundColor: "rgb(85,85,85)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "10px",
                  }}
                >
                  {/* Group Name */}
                  <h5
                    className="modal-title"
                    id="exampleModalLongTitle"
                    style={{
                      backgroundColor: "rgb(85,85,85)",
                      marginBottom: "8px",
                    }}
                  >
                    {selectedChat.chatName}
                  </h5>
                  {/* Group Members Label */}
                  <p
                    style={{
                      color: "white",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>Group Members:</strong>
                  </p>
                  {/* Grid of Member Names with Remove Option */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                      gap: "8px",
                      width: "100%",
                      padding: "0 10px",
                    }}
                  >
                    {selectedChat.users.map((member) => (
                      <div
                        key={member._id}
                        style={{
                          position: "relative",
                          backgroundColor: "wheat",
                          padding: "4px",
                          borderRadius: "4px",
                          textAlign: "center",
                          fontSize: "13px",
                          color: "black",
                        }}
                      >
                        {member.name}
                        {user.userExists._id === selectedChat.groupAdmin._id &&
                          member._id !== selectedChat.groupAdmin._id && (
                            <button
                              onClick={() => handleRemove(member)}
                              style={{
                                position: "absolute",
                                top: "-5px",
                                right: "-5px",
                                background: "red",
                                border: "none",
                                borderRadius: "50%",
                                width: "16px",
                                height: "16px",
                                color: "white",
                                fontSize: "10px",
                                lineHeight: "16px",
                                cursor: "pointer",
                              }}
                            >
                              &times;
                            </button>
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Users Grid for Removal (Duplicate or alternative view) */}
                {/* <div
                  className="users-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                    gap: "10px",
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "rgb(85,85,85)",
                    padding: "10px",
                  }}
                >
                  {users.map((u) => (
                    <div
                      className="user-item"
                      key={u._id}
                      style={{
                        backgroundColor: "wheat",
                        padding: "8px",
                        borderRadius: "8px",
                        textAlign: "center",
                        wordWrap: "break-word",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        fontWeight: "bold",
                      }}
                    >
                      <div>{u.name}</div>
                      <button
                        style={{
                          marginTop: "5px",
                          height: "28px",
                          width: "28px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "50%",
                          border: "1px solid #ccc",
                        }}
                        onClick={() => handleRemove(u)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-x"
                          viewBox="0 0 12 12"
                        >
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div> */}

                {/* Add User Section */}
                <div
                  className="d-flex"
                  style={{ backgroundColor: "rgb(85,85,85)", padding: "10px" }}
                >
                  <input
                    placeholder="Enter User to add. E.g. Arjun"
                    style={{
                      width: "50%",
                      height: "40px",
                      marginRight: "4px",
                      backgroundColor: "white",
                      color:"black"
                    }}
                    onChange={(e) => handleSearch(e)}
                    value={userToAdd}
                  />
                  <button
                    className="btn btn-info"
                    style={{
                      height: "40px",
                      padding: "0px",
                      marginBottom: "4px",
                      backgroundColor: "rgb(59, 59, 255)",
                      color: "white",
                    }}
                    onClick={() => handleAddUser(userToAdd)}
                  >
                    Add User
                  </button>
                </div>

                {/* Render Search Results */}
                <div
                  style={{
                    marginTop: "10px",
                    backgroundColor: "rgb(85,85,85)",
                    padding: "10px",
                  }}
                >
                  {searchResult?.slice(0, resultLimit).map((user) => (
                    <div
                      className="d-flex flex-row"
                      key={user._id}
                      style={{
                        padding: "3px",
                        marginBottom: "4px",
                        backgroundColor: "#f1f1f1",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleAddUser(user)}
                    >
                      <img
                        src={user.pic}
                        alt="Profile"
                        className="rounded-circle"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          marginRight: "5px",
                          marginTop: "2px",
                        }}
                      />
                      <div className="d-flex flex-column">
                        <div>{user.name}</div>
                        <div>{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rename Group Section */}
                <div
                  className="flex"
                  style={{ backgroundColor: "rgb(85,85,85)", padding: "10px" }}
                >
                  <input
                    placeholder="Enter New Group Name"
                    style={{
                      width: "50%",
                      height: "40px",
                      marginRight: "4px",
                      backgroundColor: "white",
                      color:"black"
                    }}
                    onChange={(e) => setGroupName(e.target.value)}
                    value={groupName}
                  />
                  <button
                    className="btn btn-secondary"
                    style={{
                      height: "40px",
                      padding: "0px",
                      marginBottom: "4px",
                      backgroundColor: "rgb(59, 59, 255)",
                    }}
                    onClick={() => handleRename(groupName)}
                  >
                    Rename
                  </button>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    style={{ backgroundColor: "black", color: "white" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default GroupProfile;
