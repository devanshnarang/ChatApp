import { useState, useEffect } from "react";
import AllContacts from "../components/ChatComponents/AllContacts.js";
import ChatArea from "../components/ChatComponents/ChatArea.js";
import SideBar from "../components/ChatComponents/Header.js";
import { ChatState } from "../Context/ChatProvider.js";

const Chatpage = () => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    groupchatModel,
    showgroupchatModel,
    setShowgroupchatModel,
  } = ChatState();
  const [fetchagain, setFetchagain] = useState(false);

  // Responsive state: we'll consider "laptop" (desktop) as window width >= 768px.
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isDesktop = windowWidth >= 768;

  return (
    <>
      {user ? (
        <>
          {/* Fixed Sidebar */}
          <div
            style={{
              height: "10vh",
              position: "fixed",
              width: "100%",
              top: 0,
              left: 0,
              zIndex: 101,
              backgroundColor:"rgb(85,85,85)"
            }}
          >
            <SideBar fetchagain={fetchagain} setFetchagain={setFetchagain} />
          </div>

          {/* Main Content */}
          <div
            className="d-flex"
            style={{
              height: "90vh",
              marginTop: "10vh",
              flexDirection: "row",
              overflow: "hidden", // Prevents scrolling in the main container
            }}
          >
            {isDesktop ? (
              // Desktop Layout: Show both AllContacts and ChatArea (or default message)
              selectedChat ? (
                <div className="d-flex" style={{ width: "100%", height: "90vh" }}>
                  {/* All Contacts Section */}
                  <div
                    className="flex-1"
                    style={{
                      overflowY: "auto",
                      paddingBottom: "20px",
                      flexGrow: 1,
                      height: "100%",
                      zIndex: 1,
                    }}
                  >
                    <AllContacts fetchagain={fetchagain} />
                  </div>

                  {/* Chat Area Section */}
                  <div
                    className="flex-1"
                    style={{
                      width: "50%",
                      overflowY: "hidden",
                      paddingBottom: "20px",
                      flexGrow: 1,
                      scrollbarWidth: "none",
                      height: "90vh",
                      zIndex: 1,
                      backgroundColor:"black"
                    }}
                  >
                    <ChatArea
                      fetchagain={fetchagain}
                      setFetchagain={setFetchagain}
                    />
                  </div>
                </div>
              ) : (
                <div className="d-flex" style={{ width: "100%", zIndex: 1,backgroundColor:"rgb(56,55,55)" }}>
                  {/* All Contacts Section */}
                  <div
                    className="flex-1"
                    style={{
                      overflowY: "auto",
                      paddingBottom: "20px",
                      flexGrow: 1,
                      height: "100vh",
                      zIndex: 1,
                      backgroundColor:"rgb(56,55,55)",
                      border:"20px solid",
                    }}
                  >
                    <AllContacts fetchagain={fetchagain} />
                  </div>
                  {/* Default Message */}
                  <div
                    className="d-flex flex-2 justify-content-center align-items-center"
                    style={{
                      width: "50%",
                      fontSize: "50px",
                      backgroundColor: "rgb(56,55,55)",
                      flexGrow: 1,
                      height: "100vh",
                      zIndex: showgroupchatModel ? -2 : 1,
                      position: "relative",
                    }}
                  >
                    Select a Chat to display !!
                  </div>
                </div>
              )
            ) : (
              // Mobile/Tablet Layout: Show either contacts or chat area WITHOUT a back button.
              selectedChat ? (
                <div style={{ width: "100%", height: "100vh", position: "relative" }}>
                  <ChatArea
                    fetchagain={fetchagain}
                    setFetchagain={setFetchagain}
                  />
                </div>
              ) : (
                <div style={{ width: "100%", height: "100vh" }}>
                  <AllContacts fetchagain={fetchagain} />
                </div>
              )
            )}
          </div>
        </>
      ) : (
        <div>Please log in to view the chats.</div>
      )}
    </>
  );
};

export default Chatpage;
//https://chatapp-5os8.onrender.com
