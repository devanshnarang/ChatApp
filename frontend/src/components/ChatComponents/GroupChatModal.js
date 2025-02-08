import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider.js";
import axios from "axios";

const GroupChatModal = ({ closeModal }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const { user, selectedChat, setSelectedChat, chats, setChats, showgroupchatModal, setShowgroupchatModal, socket } =
    ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // const { data } = await axios.get(`https://chatapp-5os8.onrender.com/api/user?search=${query}`, config);
      const { data } = await axios.get(`/api/user?search=${query}`, config);

      setSearchResult(data);
    } catch (error) {
      alert("Error fetching users. Please try again!");
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      alert("Please fill all the fields!");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // const { data } = await axios.post(
      //   "https://chatapp-5os8.onrender.com/api/chat/group",
      //   {
      //     name: groupChatName,
      //     users: JSON.stringify(selectedUsers.map((u) => u._id)),
      //   },
      //   config
      // );
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      console.log(data);
      setChats([data, ...chats]);
      socket.emit("groupCreate", data);
      // setSelectedChat(data);
      closeModal();
    } catch (error) {
      alert("Failed to create group chat. Please try again!");
    }
  };

  const handleAddGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      alert("User already added!");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (userToRemove) => {
    setSelectedUsers(
      selectedUsers.filter((user) => user._id !== userToRemove._id)
    );
  };

  useEffect(() => {
    if (!search) {
      setSearchResult([]);
    }
  }, [search]);

  return (
    <>
      {showgroupchatModal && (
        <>
          {/* Backdrop */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 100, }}
          ></div>
          {/* Modal */}
          <div
            className={`modal fade show`}
            tabIndex="-1"
            role="dialog"
            style={{
              display: "block",
              zIndex: 101,
              backgroundColor: "rgb(143,143,143)"
            }}
            aria-labelledby="exampleModalCenterTitle"
            aria-hidden="false"
          >
            <div className="modal-dialog modal-dialog-centered" role="document" style={{ backgroundColor: "rgb(143,143,143)" }}>
              <div
                className="modal-content"
                style={{ backgroundColor: "rgb(85,85,85)", color: "black" }}
              >
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLongTitle">
                    Create Group
                  </h5>
                </div>
                <div className="modal-body d-flex flex-column align-self-stretch mb-2">
                  {/* Selected Users */}
                  <div className="d-flex" >
                    {selectedUsers?.map((u) => (
                      <div
                        key={u._id}
                        className="d-flex align-items-center mb-1 me-1 p-1 bg-light border rounded"
                        style={{ gap: "2px" }}
                      >
                        <div style={{ color: "black", backgroundColor: "white" }}>{u.name}</div>
                        <div>
                          <button
                            type="button"
                            className="close btn btn-outline-info hover-enlarge"
                            aria-label="Close"
                            style={{ backgroundColor: "white",fontSize:"1rem" }}
                            onClick={() => handleDelete(u)}
                          >
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Input Fields */}
                  <input
                    placeholder="Group Name"
                    className="mb-2"
                    onChange={(e) => setGroupChatName(e.target.value)}
                    style={{ backgroundColor: "rgb(255, 255, 255)", color: "black" }}
                  />
                  <input
                    placeholder="Add Users Eg. Ayush, Hardik, Daksh"
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ backgroundColor: "rgb(255, 255, 255)", color: "black" }}
                  />
                  {searchResult?.slice(0, 4).map((user) => (
                    <div id={user._id}>
                      <button
                        className="mt-2 border border-dark"
                        id={user._id}
                        style={{
                          backgroundColor: "rgb(143,143,143)",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          width: "200px",
                          textAlign: "left",
                        }}
                        onClick={() => handleAddGroup(user)}
                      >
                        {user.name}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="modal-footer" style={{ backgroundColor: "rgb(85,85,85)", color: "black" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    Create
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

export default GroupChatModal;
