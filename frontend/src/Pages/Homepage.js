import React, { useEffect, useState } from "react";
import Login from "../components/Authentication/Login.js";
import Signup from "../components/Authentication/Signup.js";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  // State to toggle between Login and Signup forms
  const [isLogin, setIsLogin] = useState(false);

  // Toggle between Login and Signup
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #000000, #1a1a1a)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "50%",
          backgroundColor: "rgba(30,30,30,0.9)",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={toggleForm}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#6200EE",
              color: "#ffffff",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#7e3ff2")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#6200EE")
            }
          >
            {isLogin ? "Switch To Signup" : "Switch To Login"}
          </button>
        </div>
        <div>
          {isLogin ? (
            <Login isLogin={isLogin} setIsLogin={setIsLogin} />
          ) : (
            <Signup isLogin={isLogin} setIsLogin={setIsLogin} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
