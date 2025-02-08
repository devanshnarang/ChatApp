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

  // Function to handle image upload via Cloudinary
  const postDetails = (pics) => {
    if (!pics) {
      alert("Please select a profile picture.");
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      setIsUploading(true);
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chatap"); // Your upload preset
      data.append("cloud_name", "dmwwxqq1l"); // Your Cloudinary cloud name

      fetch("https://api.cloudinary.com/v1_1/dmwwxqq1l/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.secure_url) {
            setPic(data.secure_url);
          } else {
            alert("Image upload failed. Check the response data.");
            console.log("Response from Cloudinary:", data);
          }
          setIsUploading(false);
        })
        .catch((err) => {
          console.error("Error uploading image:", err);
          setIsUploading(false);
        });
    } else {
      alert("Invalid image type. Please upload a JPEG or PNG image.");
    }
  };

  // Function to handle Signup submission
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
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
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

  // Toggle for showing/hiding password text
  const handleClick = (e) => {
    e.preventDefault();
    setShow(!show);
  };

  // Prevent default form submission behavior
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  // Responsive state: track window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define breakpoints:
  // isMobile: for screens narrower than 576px
  // isTablet: for screens between 576px and 768px
  const isMobile = windowWidth < 576;
  const isTablet = windowWidth >= 576 && windowWidth < 768;

  // Outer container style
  const outerContainerStyle = {
    background: "linear-gradient(135deg, #000000, #1a1a1a)",
    minHeight: isMobile ? "auto" : "50vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isMobile ? "10px" : "20px",
  };

  // Form container style
  const formStyle = {
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    padding: isMobile ? "20px" : isTablet ? "30px" : "40px",
    borderRadius: isMobile ? "8px" : "12px",
    width: "100%",
    maxWidth: isMobile ? "100%" : "450px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(8px)",
  };

  // Label style for input fields
  const labelStyle = {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: "0.5rem",
    display: "block",
  };

  // Input style for text, email, and password fields
  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #444444",
    backgroundColor: "#2a2a2a",
    color: "#ffffff",
    outline: "none",
  };

  return (
    <div style={outerContainerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Name Input */}
        <div className="mb-3" style={{ marginBottom: "1rem" }}>
          <label htmlFor="signupName" className="form-label" style={labelStyle}>
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="signupName"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>
        {/* Email Input */}
        <div className="mb-3" style={{ marginBottom: "1rem" }}>
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
        {/* Password Input */}
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
              width: isMobile ? "100%" : "30%",
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
        </div>
        {/* Confirm Password Input */}
        <div
          className="mb-3 d-flex align-items-center"
          style={{
            marginBottom: "1rem",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
          }}
        >
          <label
            htmlFor="confirmPassword"
            className="form-label"
            style={{
              ...labelStyle,
              width: isMobile ? "100%" : "30%",
              marginRight: isMobile ? "0" : "10px",
            }}
          >
            Confirm Password
          </label>
          <input
            type={show ? "text" : "password"}
            className="form-control form-control-sm"
            id="confirmPassword"
            placeholder="Confirm Password"
            value={confirmpassword}
            onChange={(e) => setConfirmpassword(e.target.value)}
            style={{ ...inputStyle, flex: "1", marginBottom: isMobile ? "10px" : "0" }}
          />
          <button
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={handleClick}
            style={{
              marginLeft: isMobile ? "0" : "10px",
              padding: "8px 12px",
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
        {/* Profile Pic Input */}
        <div className="mb-3" style={{ marginBottom: "1rem" }}>
          <label htmlFor="profilePic" className="form-label" style={labelStyle}>
            Profile Pic
          </label>
          <input
            type="file"
            className="form-control"
            id="profilePic"
            onChange={(e) => postDetails(e.target.files[0])}
            style={{
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
              border: "1px solid #444444",
              borderRadius: "6px",
              padding: "8px",
            }}
          />
        </div>
        {/* Signup Button */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          onClick={submitHandler}
          disabled={isUploading}
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
          {isUploading ? "Uploading..." : "Signup"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
