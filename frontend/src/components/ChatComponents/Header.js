import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider.js";
import Profile from "./Profile.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GroupChatModal from "./GroupChatModal.js";

const SideBar = ({ fetchagain, setFetchagain }) => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    showgroupchatModal,
    setShowgroupchatModal,
  } = ChatState();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openGroupModal = () => setShowgroupchatModal(true);
  const closeGroupModal = () => setShowgroupchatModal(false);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

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
      alert("Failed to fetch your Chats. Try again!!");
      return;
    }
  };

  const handleSearch = async (e) => {
    const d = e.target.value;
    setSearch(d);
    if (!d) {
      setSearchResult([]);
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${d}`, config);
      const filteredResults = data.filter((u) => u._id !== user._id);
      setSearchResult(filteredResults);
      setFetchagain(!fetchagain);
      return;
    } catch (error) {
      alert("Error occurred, failed to load the searched user!! ");
      return;
    }
  };

  const handleSearchClone = async (e) => {
    if (!search) {
      setSearchResult([]);
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      const filteredResults = data.filter((u) => u._id !== user._id);
      setSearchResult(filteredResults);
      setFetchagain(!fetchagain);
      return;
    } catch (error) {
      alert("Error occurred, failed to load the searched user!! ");
      return;
    }
  };

  const accessChats = async (userId) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chat", { userId }, config);
      setSelectedChat(data);
      setSearch("");
      return;
    } catch (error) {
      alert("Can't find the Searched User!! ");
      return;
    }
  };

  useEffect(() => {
    if (!search) {
      setSearchResult([]);
    }
  }, [search]);

  useEffect(() => {
    console.log("Called in All contacts!!");
    const x = localStorage.getItem("userInfo");
    if (x) {
      fetchChats();
    }
  }, [fetchagain]);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div
          style={{
            padding: "10px 30px 10px 10px",
            display: "flex",
            justifyContent: "space-between", // Separates start and end containers
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Start Container: Chatsapp and Search Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: "bold",
            }}
          >
            <a
              className="navbar-brand"
              href="#"
              style={{ fontSize: "xx-large" }}
            >
              Chatsapp
            </a>

            {/* Search bar */}
            <div style={{ position: "relative" }}>
              <input
                placeholder="Search Name"
                style={{
                  backgroundColor: "white",
                  marginRight: "5px",
                  width: "250px",
                }}
                onChange={(e) => handleSearch(e)}
              />
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSearchClone}
              >
                Search
              </button>

              {/* Search results dropdown */}
              {searchResult.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "40px", // Adjust position below the search bar
                    left: "0",
                    right: "0",
                    zIndex: 3,
                    maxHeight: "200px",
                    overflowY: "auto",
                    backgroundColor: "white",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                    borderRadius: "5px",
                    padding: "5px",
                  }}
                >
                  {searchResult?.map((user) => (
                    <div
                      className="d-flex flex-row-evenly"
                      key={user._id}
                      style={{
                        marginBottom: "10px",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => accessChats(user._id)}
                    >
                      <img
                        src={user.pic}
                        className="rounded-circle"
                        style={{ width: "40px", height: "40px" }}
                      />
                      <span style={{ marginLeft: "10px" }}>{user.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
            <div style={{marginRight:'10px'}}>
              <button
                onClick={openGroupModal}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  backgroundColor: "green",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                New Group +
              </button>
            </div>

            {/* End Container: User Profile */}
            <div>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user?.userExists?.pic && (
                    <img
                      src={user.userExists.pic}
                      className="rounded-circle"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                      alt="User Avatar"
                    />
                  )}
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="#" onClick={openModal}>
                      My Profile
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={logoutHandler}
                    >
                      LogOut
                    </a>
                  </li>
                </ul>
              </li>
            </div>
          </div>
        </div>
      </nav>
      <GroupChatModal closeModal={closeGroupModal} />
      {/* Profile Modal */}
      <Profile
        showModal={showModal}
        closeModal={closeModal}
        user={user.userExists}
      />
    </>
  );
};

export default SideBar;
