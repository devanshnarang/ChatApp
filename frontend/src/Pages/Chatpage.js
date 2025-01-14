import { useEffect, useState } from "react";
import AllContacts from "../components/ChatComponents/AllContacts.js";
import ChatArea from "../components/ChatComponents/ChatArea.js";
import SideBar from "../components/ChatComponents/Header.js";
import { ChatState } from "../Context/ChatProvider.js";

const Chatpage = () => {
  const { user, selectedChat, setSelectedChat,groupchatModel,showgroupchatModel,setShowgroupchatModel } = ChatState();
  const [fetchagain, setFetchagain] = useState(false);


  return (
    <>
      {user ? (
        <>
          {/* Fixed Sidebar */}
          <div
            style={{
              height: "6vh",
              position: "fixed",
              width: "100%",
              top: 0,
              left: 0,
              zIndex: 101,
            }}
          >
            <SideBar fetchagain={fetchagain} setFetchagain={setFetchagain} />
          </div>

          {/* Main Content */}
          <div
            className="d-flex"
            style={{
              height: "90vh",
              marginTop: "12vh",
              flexDirection: "row",
              overflow: "hidden", // Prevents scrolling in the main container
            }}
          >
            {selectedChat ? (
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
                    // backgroundColor:'wheat',
                    paddingBottom: "20px",
                    flexGrow: 1,
                    scrollbarWidth: "none",
                    height: "90vh",
                    zIndex: 1,
                  }}
                >
                  <ChatArea
                    fetchagain={fetchagain}
                    setFetchagain={setFetchagain}
                  />
                </div>
              </div>
            ) : (
              <div className="d-flex" style={{ width: "100%", zIndex: 1 }}>
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

                {/* Default Message */}
                <div 
                  className="d-flex flex-2 justify-content-center align-items-center" 
                  style={{ 
                    width: '50%', 
                    fontSize: '50px', 
                    backgroundColor: 'green', 
                    flexGrow: 1, 
                    height: '100%',
                    zIndex:showgroupchatModel?-2:1,
                    position:"relative"
                  }}
                >
                  Select a Chat to display !!
                </div>
              </div>
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
