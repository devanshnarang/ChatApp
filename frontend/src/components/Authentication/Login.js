import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider.js";

const Login = ({ isLogin, setIsLogin }) => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    if (!email || !password) {
      alert("Please fill all the details");
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "https://chatapp-5os8.onrender.com/api/user/login",
        { email, password },
        config
      );
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/backup");
    } catch (error) {
      console.log("An error occurred");
      console.log(error.message);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    setShow(!show);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  // Responsive logic: Track window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define breakpoints:
  // isMobile: for screens narrower than 576px
  // isTablet: for screens between 576px and 768px
  // isSmallMobile: for screens narrower than 375px (e.g., iPhone SE)
  const isMobile = windowWidth < 576;
  const isTablet = windowWidth >= 576 && windowWidth < 768;
  const isSmallMobile = windowWidth < 375;

  // Outer container style
  const outerContainerStyle = {
    background: "linear-gradient(135deg, #000000, #1a1a1a)",
    minHeight: isMobile ? "auto" : "50vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isSmallMobile ? "5px" : isMobile ? "10px" : "20px",
  };

  // Form container style
  const formStyle = {
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    padding: isSmallMobile ? "10px" : isMobile ? "15px" : isTablet ? "20px" : "20px",
    borderRadius: isSmallMobile ? "6px" : isMobile ? "8px" : "12px",
    width: "100%",
    maxWidth: isMobile ? "100%" : "450px",
    height: isMobile ? "auto" : "90%",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(8px)",
  };

  // Label style
  const labelStyle = {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: "0.5rem",
    display: "block",
    width: isMobile ? "100%" : "30%",
  };

  // Input style
  const inputStyle = {
    width: "100%",
    padding: isSmallMobile ? "8px" : "10px",
    borderRadius: "6px",
    border: "1px solid #444444",
    backgroundColor: "#2a2a2a",
    color: "#ffffff",
    outline: "none",
  };

  return (
    <div style={outerContainerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div
          className="mb-3"
          style={{
            marginBottom: "1rem",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: isMobile ? "flex-start" : "space-between",
          }}
        >
          <label htmlFor="signupEmail" className="form-label" style={labelStyle}>
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="signupEmail"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div
          className="mb-3 d-flex align-items-center"
          style={{
            marginBottom: "1rem",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
          }}
        >
          <label
            htmlFor="signupPassword"
            className="form-label"
            style={{
              ...labelStyle,
              width: isMobile ? "100%" : "22%",
              marginRight: isMobile ? "0" : "10px",
            }}
          >
            Password
          </label>
          <input
            type={show ? "text" : "password"}
            className="form-control form-control-sm"
            id="signupPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, flex: "1", marginBottom: isMobile ? "10px" : "0" }}
          />
          <button
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={handleClick}
            style={{
              marginLeft: isMobile ? "0" : "10px",
              padding: isSmallMobile ? "6px 10px" : "8px 12px",
              borderRadius: "6px",
              border: "1px solid #444444",
              backgroundColor: "#333333",
              color: "#ffffff",
              cursor: "pointer",
              marginTop: isMobile ? "10px" : "0",
            }}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          onClick={submitHandler}
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
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#7e3ff2")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6200EE")}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
