import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider.js";
import Profile from "./Profile.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GroupChatModal from "./GroupChatModal.js";
import { v4 as uuidv4 } from "uuid";
import RecoveryKeyModal from "./RecoveryKeyModel.js";

const SideBar = ({ fetchagain, setFetchagain }) => {
  // -----------------------
  // Helper Functions for Encryption
  // -----------------------
  function toBase64(uint8Array) {
    return btoa(String.fromCharCode(...uint8Array));
  }

  async function deriveEncryptionKey(password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const encryptionKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    return { encryptionKey, salt };
  }

  async function encryptPrivateKey(privateKey, password) {
    const { encryptionKey, salt } = await deriveEncryptionKey(password);
    const encoder = new TextEncoder();
    const privateKeyBytes = encoder.encode(privateKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedPrivateKey = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      encryptionKey,
      privateKeyBytes
    );
    return { encryptedPrivateKey, iv, salt };
  }

  async function handlePrivateKeyEncryption(password, privateKey) {
    const { encryptedPrivateKey, iv, salt } = await encryptPrivateKey(privateKey, password);
    const encryptedPrivateKeyBase64 = toBase64(new Uint8Array(encryptedPrivateKey));
    const ivBase64 = toBase64(new Uint8Array(iv));
    const saltBase64 = toBase64(new Uint8Array(salt));
    return {
      privateKey: encryptedPrivateKeyBase64,
      salt: saltBase64,
      iv: ivBase64,
    };
  }

  // -----------------------
  // Context & Navigation
  // -----------------------
  const { user, setSelectedChat, chats, setChats, showgroupchatModal, setShowgroupchatModal, socket } = ChatState();
  const navigate = useNavigate();

  // -----------------------
  // Local State
  // -----------------------
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryKeyForModal, setRecoveryKeyForModal] = useState("");

  // -----------------------
  // Responsive State
  // -----------------------
  // Breakpoints:
  // Mobile: <576px, Tablet: 576px - 767px, Desktop: ≥768px
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 576;
  const isTablet = windowWidth >= 576 && windowWidth < 768;

  // -----------------------
  // Modal Handlers
  // -----------------------
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const openGroupModal = () => setShowgroupchatModal(true);
  const closeGroupModal = () => setShowgroupchatModal(false);

  // -----------------------
  // Logout & Recovery
  // -----------------------
  const logoutHandler = async () => {
    const numericCode = Math.abs(parseInt(uuidv4().replace(/-/g, ""), 16) % 1000000)
      .toString()
      .padStart(6, "0");
    const { privateKey, salt, iv } = await handlePrivateKeyEncryption(
      `${numericCode}`,
      localStorage.getItem("privateKey")
    );
    try {
      const res = await axios.post(
        "https://chatapp-5os8.onrender.com/api/user/handle-backup",
        { privateKey, salt, iv },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (res.data.success) {
        setRecoveryKeyForModal(numericCode);
        setShowRecoveryModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const confirmLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem("userInfo");
    localStorage.removeItem("privateKey");
    navigate("/");
  };

  // -----------------------
  // API Calls & Search
  // -----------------------
  const fetchChats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("https://chatapp-5os8.onrender.com/api/chat", config);
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
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`https://chatapp-5os8.onrender.com/api/user?search=${d}`, config);
      const filteredResults = data.filter((u) => u._id !== user._id);
      setSearchResult(filteredResults);
      setFetchagain(!fetchagain);
      return;
    } catch (error) {
      alert("Error occurred, failed to load the searched user!! ");
      return;
    }
  };

  const handleSearchClone = async () => {
    if (!search) {
      setSearchResult([]);
      setSearch("");
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`https://chatapp-5os8.onrender.com/api/user?search=${search}`, config);
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
      const { data } = await axios.post("https://chatapp-5os8.onrender.com/api/chat", { userId }, config);
      setSearch("");
      setSelectedChat(data);
      socket.emit("fetchRecentChats", user.userExists._id);
      return;
    } catch (error) {
      alert("Can't find the Searched User!! ");
      return;
    }
  };

  useEffect(() => {
    if (!search) {
      setSearch("");
      setSearchResult([]);
    }
  }, [search]);

  useEffect(() => {
    const x = localStorage.getItem("userInfo");
    if (x) {
      fetchChats();
    }
  }, [fetchagain]);

  useEffect(() => {
    socket.on("chatupdated", (populatedChats) => {
      setChats(populatedChats);
    });
    return () => {
      socket.off("chatupdated");
      socket.disconnect();
    };
  }, []);

  // -----------------------
  // RENDER
  // -----------------------
  return (
    <>
      <nav
        className="navbar navbar-expand-lg bg-body-tertiary"
        style={{
          padding: isMobile || isTablet ? "5px 10px" : "10px 30px 10px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        {/* Left Side: Brand and Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile || isTablet ? "5px" : "10px",
            fontWeight: "bold",
          }}
        >
          <a
            className="navbar-brand"
            href="#"
            style={{
              fontSize: isMobile ? "1.2rem" : isTablet ? "1.5rem" : "xx-large",
              marginRight: "10px",
            }}
          >
            Chatsapp
          </a>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              placeholder="Search Name"
              style={{
                backgroundColor: "white",
                marginRight: "5px",
                // Reduced widths:
                width: isMobile ? "40%" : isTablet ? "45%" : "80px",
                padding: isMobile ? "3px 5px" : "8px",
                fontSize: isMobile ? "0.7rem" : isTablet ? "0.8rem" : "1rem",
              }}
              onChange={(e) => handleSearch(e)}
            />
            {isMobile || isTablet ? (
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSearchClone}
                style={{
                  width: isMobile ? "40px" : "45px",
                  padding: isMobile ? "3px" : "4px",
                  fontSize: isMobile ? "0.7rem" : "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fa fa-search"></i>
              </button>
            ) : (
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSearchClone}
                style={{
                  width: "auto",
                  marginTop: "5px",
                  padding: "8px 14px",
                  fontSize: "1rem",
                }}
              >
                Search
              </button>
            )}
            {searchResult.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: isMobile || isTablet ? "50px" : "40px",
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
                      alt="User"
                    />
                    <span style={{ marginLeft: "10px" }}>{user.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Right Side: Options */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile || isTablet ? "5px" : "10px",
          }}
        >
          <div>
            <button
              onClick={openGroupModal}
              style={{
                padding: isMobile || isTablet ? "3px 6px" : "5px 10px",
                backgroundColor: "green",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: isMobile || isTablet ? "0.8rem" : "1rem",
                marginLeft: "1.5px",
              }}
            >
              New Group +
            </button>
          </div>
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
                      width: isMobile ? "30px" : isTablet ? "35px" : "40px",
                      height: isMobile ? "30px" : isTablet ? "35px" : "40px",
                      objectFit: "cover",
                    }}
                    alt="User Avatar"
                  />
                )}
              </a>
              <ul className="dropdown-menu" style={isMobile ? {} : { marginTop: "10px", left: "auto", right: "15%" }}>
                <li>
                  <a className="dropdown-item" href="#" onClick={openModal}>
                    My Profile
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#" onClick={logoutHandler}>
                    LogOut
                  </a>
                </li>
              </ul>
            </li>
        </div>
      </nav>
      <GroupChatModal closeModal={closeGroupModal} />
      {/* Profile Modal */}
      <Profile showModal={showModal} closeModal={closeModal} user={user.userExists} />
      {showRecoveryModal && (
        <RecoveryKeyModal
          recoveryKey={recoveryKeyForModal}
          onConfirm={confirmLogout}
          onCancel={() => setShowRecoveryModal(false)}
        />
      )}
    </>
  );
};

export default SideBar;
