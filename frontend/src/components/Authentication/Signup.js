import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { generateKeyPair } from "../EncryptionDecryption/GenerateKey.js";

const Signup = ({ isLogin, setIsLogin }) => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Adjust viewport height for mobile devices
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const outerContainerStyle = {
    background: "linear-gradient(135deg, #000000, #1a1a1a)",
    minHeight: `${viewportHeight}px`, // Use actual inner height for mobile devices
    padding: "20px",
    boxSizing: "border-box",
    overflowY: "auto",
  };

  const formStyle = {
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    padding: "25px",
    borderRadius: "12px",
    maxWidth: "450px",
    margin: "20px auto",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(8px)",
    boxSizing: "border-box",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #444444",
    backgroundColor: "#2a2a2a",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  };

  const submitHandler = async () => {
    if (password !== confirmpassword) {
      alert("Password and Confirm Password fields don't match!");
      return;
    }
    if (isUploading) {
      alert("Please wait until the image upload is complete.");
      return;
    }
    if (!pic) {
      alert("Please upload a profile picture.");
      return;
    }
    try {
      const { publicKey, privateKey } = await generateKeyPair();
      localStorage.setItem("privateKey", privateKey);
      const config = { headers: { "Content-type": "application/json" } };
      await axios.post(
        "https://chatapp-5os8.onrender.com/api/user/register",
        { name, email, password, pic, publicKey },
        config
      );
      setIsLogin(!isLogin);
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  };

  return (
    <div style={outerContainerStyle}>
      <form style={formStyle}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ color: "#ffffff", fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
            Name
          </label>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ color: "#ffffff", fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
            Email address
          </label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ color: "#ffffff", fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
            Password
          </label>
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ color: "#ffffff", fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
            Confirm Password
          </label>
          <input
            type={show ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmpassword}
            onChange={(e) => setConfirmpassword(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button
          type="button"
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
          }}
        >
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;
