import React, { useEffect, useState } from "react";
import Login from "../components/Authentication/Login.js";
import Signup from "../components/Authentication/Signup.js";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();

  // Check for an existing user and redirect if found
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  // State to toggle between Login and Signup forms
  const [isLogin, setIsLogin] = useState(false);
  const toggleForm = () => setIsLogin(!isLogin);

  // Responsive state based on window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define breakpoints for mobile and tablet
  const isMobile = windowWidth < 576;
  const isTablet = windowWidth >= 576 && windowWidth < 768;

  // Outer container style with vertical scrolling enabled
  const outerContainerStyle = {
    background: "linear-gradient(135deg, #000000, #1a1a1a)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: isMobile ? "10px" : "20px",
    overflowY: "auto", // Enable vertical scrolling
  };

  // Card container style (form container)
  const cardStyle = {
    width: "100%",
    maxWidth: isMobile ? "90%" : "450px",
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    padding: isMobile ? "20px" : isTablet ? "30px" : "40px",
    borderRadius: isMobile ? "8px" : "12px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(8px)",
    boxSizing: "border-box", // Ensure padding is included in the width
  };

  // Toggle button style
  const toggleButtonStyle = {
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
  };

  return (
    <div style={outerContainerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={toggleForm}
            style={toggleButtonStyle}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#7e3ff2")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#6200EE")
            }
          >
            {isLogin ? "Signup" : "Login"}
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
