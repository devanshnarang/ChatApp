import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import Profile from "./Profile";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SideBar = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const {user,setSelectedChat,chats,setChats}=ChatState();
  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };
  useEffect(()=>{
    if(!search){
      setSearchResult([])
    }
  },[search])

  const handleSearch = async () => {
    if (!search) {
      alert("Search not valid!! ");
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
      return;
    } catch (error) {
      alert("Error occured, failed to load the searched user!! ");
      return;
    }
  };

  const accessChats = async(userId)=>{
    try {
      const config = {
        headers: {
          "Content-type":"application/json",
          Authorization: `Bearer ${user.token}`
        },
      };
      const {data}=await axios.post('/api/chat',{userId},config);
      console.log(data);
      setSelectedChat(data);
      setSearch("");
      return;
    } catch (error) {
      alert("Can't find the Searched User!! ");
      return;
    }
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Chatsapp
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
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
            </ul>

            {/* Button to trigger offcanvas */}
            <div>
              <input
                placeholder="Search Name"
                style={{ backgroundColor: "white", marginRight: "5px" }}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSearch}
              >
                Search
              </button>
              <div>
                {searchResult?.map((user) => (
                  <div className="list-group" style={{margin:'5px',marginLeft:'-2px'}} key={user._id}>
                    <div className="d-flex flex-row-evenly">
                      <img src={user.pic} className="rounded-circle" style={{width:'40px',height:'40px'}}/>
                    <button
                      type="button"
                      className="list-group-item list-group-item-action"
                      key={user._id}
                      onClick={()=>accessChats(user._id)}
                      style={{height:'40px',width:'150'}}
                    >
                      {user.email}
                    </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      <Profile showModal={showModal} closeModal={closeModal} user={user.userExists} />
    </>
  );
};

export default SideBar;
