import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";

const GroupChatModal = ({ showModal, closeModal }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const { user, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      console.log("NOT FOUND!!");
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
    } catch (error) {
      alert("Error in creating a group, try again!! ");
    }
  };

  const handleSubmit = async() => {
    try {
        if(!groupChatName || !selectedUsers){
            alert("Please fill all the fields!! ");
            return;
        }
        try {
            const config={
                headers:{
                    Authorization:`Bearer ${user.token}`,
                },
            };

            const {data} =await axios.post('/api/chat/group',{name:groupChatName,users:JSON.stringify(selectedUsers.map((u)=>u._id))},config);
            setChats([data,...chats]);
            closeModal();
            return;
        } catch (error) {
            alert("Can't create group, try again!!");
            return;
        }
    } catch (error) {}
  };

  const handleAddGroup = async (userToAdd) => {
    if (selectedUsers?.includes(userToAdd)) {
      alert("User already added!! ");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete=(userToRemove)=>{
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userToRemove._id));
  }

  useEffect(()=>{
    if(!search){
        setSearchResult([]);
    }
  },[search])

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
                    Create Group
                  </h5>
                </div>
                <div className="modal-body d-flex flex-column align-self-stretch mb-2">
                  <div className="d-flex">
                    {selectedUsers?.map((u) => (
                      <div
                        key={u._id}
                        className="d-flex align-items-center mb-1 me-1 p-1 bg-light border rounded"
                        style={{ gap: "2px" }}
                      >
                        <div>{u.name}</div>
                        <div>
                          <button
                            type="button"
                            className="close btn btn-outline-info"
                            aria-label="Close"
                            onClick={()=>handleDelete(u)}
                          >
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <input
                    placeholder="Group Name"
                    className="mb-2"
                    onChange={(e) => setGroupChatName(e.target.value)}
                  />
                  <input
                    placeholder="Add Users Eg. Ayush, Hardik, Daksh"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {searchResult?.slice(0, 4).map((user) => (
                    <div id={user._id}>
                      <button
                        className="mt-2 border border-dark"
                        id={user._id}
                        style={{
                          backgroundColor: "rgb(148, 173, 251)",
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
                <div className="modal-footer">
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
