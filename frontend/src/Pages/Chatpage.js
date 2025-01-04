import { useState } from "react";
import AllContacts from "../components/ChatComponents/AllContacts.js";
import ChatArea from "../components/ChatComponents/ChatArea.js";
import SideBar from "../components/ChatComponents/Header.js";
import { ChatState } from "../Context/ChatProvider.js";

const Chatpage = () => {
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [fetchagain, setFetchagain] = useState(false);

  console.log("Selected Chat in Layout:", selectedChat);

  return (
    <>
      {user ? (
        <>
          {/* Fixed Sidebar */}
          <div style={{ height: '10vh', position: 'fixed', width: '100%', top: 0, left: 0 }}>
            <SideBar />
          </div>

          {/* Main Content */}
          <div className="d-flex" style={{ height: "calc(100vh - 10vh)", marginTop: '10vh', flexDirection: 'row' }}>
            {selectedChat ? (
              <div className="d-flex" style={{ width: '100%' }}>
                {/* All Contacts Section */}
                <div className="flex-1" style={{ overflowY: 'auto', paddingBottom: '20px', flexGrow: 1 }}>
                  <AllContacts fetchagain={fetchagain} />
                </div>

                {/* Chat Area Section */}
                <div className="flex-2" style={{ width: '50%', backgroundColor: 'rgb(252, 242, 223)', overflowY: 'auto', paddingBottom: '20px', flexGrow: 1 }}>
                  <ChatArea fetchagain={fetchagain} setFetchagain={setFetchagain} />
                </div>
              </div>
            ) : (
              <div className="d-flex" style={{ width: '100%' }}>
                {/* All Contacts Section */}
                <div className="flex-1" style={{ overflowY: 'auto', paddingBottom: '20px', flexGrow: 1 }}>
                  <AllContacts fetchagain={fetchagain} />
                </div>

                {/* Default Message */}
                <div className="d-flex flex-2 justify-content-center align-items-center" style={{ width: '50%', fontSize: '50px', backgroundColor: 'violet', flexGrow: 1 }}>
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
