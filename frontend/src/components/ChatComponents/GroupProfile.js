import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";

const GroupProfile = ({
  showModal,
  closeModal,
  users,
  setUsers,
  fetchagain,
  setFetchagain,
  fetchMessages
}) => {
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [groupName, setGroupName] = useState("");
  const [userToAdd, setUserToAdd] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [resultLimit, setResultLimit] = useState(4); // Limit number of results shown

  const handleRemove = async (u) => {
    if(selectedChat?.groupAdmin._id!==user.userExists._id){
      alert("Only Admin can Add!!");
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post('/api/chat/groupremove',{chatId:selectedChat._id,userId:u._id}, config);
      (user._id===u._id)?setSelectedChat():setSelectedChat(data);
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
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/rename",
        { chatId: selectedChat._id, chatName: g },
        config
      );
      setSelectedChat(data);
      setFetchagain(!fetchagain);
    } catch (error) {
      alert(error);
      alert("Try Again!! ");
    }
  };

  const handleSearch = async (e) => {
    const s = e.target.value;
    setUserToAdd(e.target.value);
    if (!s) {
      setSearchResult([]);
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${userToAdd}`, config);
      setSearchResult(data);
    } catch (error) {
      alert("No user found with the given name!!");
    }
  };

  const handleAddUser = async (u) => {
    if(selectedChat?.users.find((t)=>t._id===u._id)){
      alert("User already in the group!!");
      return;
    }
    if(selectedChat?.groupAdmin._id!==user.userExists._id){
      alert("Only Admin can Add!!");
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post('/api/chat/groupAdd',{chatId:selectedChat._id,userId:u._id}, config);
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
            style={{ zIndex: 1040 }}
          ></div>
          {/* Modal */}
          <div
            className={`modal fade show`}
            tabIndex="-1"
            role="dialog"
            style={{ display: "block", zIndex: 1050 }}
            aria-labelledby="exampleModalCenterTitle"
            aria-hidden="false"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLongTitle">
                    {selectedChat.chatName}
                  </h5>
                </div>
                <div className="d-flex flex-row mb-2">
                  {users.map((u) => {
                    return (
                      <div
                        className="d-flex flex-row"
                        key={u._id}
                        style={{ backgroundColor: "wheat", marginRight: "4px" }}
                      >
                        <div>{u.email}</div>
                        <div>
                          <button
                            style={{
                              height: "28px",
                              width: "28px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              borderRadius: "50%",
                              borderBlock: "wheat",
                              border: "1px solid #ccc",
                              marginLeft: "8px",
                              padding: "0px 4px 4px 0px",
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
                      </div>
                    );
                  })}
                </div>

                <div className="d-flex">
                  <input
                    placeholder="Enter User to add. E.g. Arjun"
                    style={{
                      width: "50%",
                      height: "40px",
                      marginRight: "4px",
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
                    }}
                    onClick={() => handleAddUser(userToAdd)} // Handle user addition
                  >
                    Add User
                  </button>
                </div>

                <div style={{ marginTop: "10px" }}>
                  {/* Render search results below the search bar */}
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
                      onClick={() => handleAddUser(user)} // Add user when clicked
                    >
                      <img
                      src={user.pic}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                        marginRight:'5px',
                        marginTop:'2px'
                      }}
                    />
                      <div className="d-flex flex-column">
                        <div>{user.name}</div>
                        <div>{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex">
                  <input
                    placeholder="Enter New Group Name"
                    style={{
                      width: "50%",
                      height: "40px",
                      marginRight: "4px",
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
                    }}
                    onClick={() => handleRename(groupName)}
                  >
                    Rename
                  </button>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
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
