import React, { useState } from "react";
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
      await axios.post("https://chatapp-5os8.onrender.com/api/user/register", { name, email, password, pic, publicKey }, config);
      // await axios.post("/api/user/register", { name, email, password, pic, publicKey }, config);
      setIsLogin(!isLogin);
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    setShow(!show);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #000000, #1a1a1a)",
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "rgba(30, 30, 30, 0.9)",
          padding: "40px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Name Input */}
        <div className="mb-3" style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="signupName"
            className="form-label"
            style={{
              color: "#ffffff",
              fontWeight: "600",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="signupName"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #444444",
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
              outline: "none",
            }}
          />
        </div>
        {/* Email Input */}
        <div className="mb-3" style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="signupEmail"
            className="form-label"
            style={{
              color: "#ffffff",
              fontWeight: "600",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="signupEmail"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #444444",
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
              outline: "none",
            }}
          />
        </div>
        {/* Password Input */}
        <div
          className="mb-3 d-flex align-items-center"
          style={{ marginBottom: "1rem" }}
        >
          <label
            htmlFor="signupPassword"
            className="form-label"
            style={{
              color: "#ffffff",
              fontWeight: "600",
              marginRight: "10px",
              whiteSpace: "nowrap",
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
            style={{
              flex: "1",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #444444",
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
              outline: "none",
            }}
          />
        </div>
        {/* Confirm Password Input */}
        <div
          className="mb-3 d-flex align-items-center"
          style={{ marginBottom: "1rem" }}
        >
          <label
            htmlFor="confirmPassword"
            className="form-label"
            style={{
              color: "#ffffff",
              fontWeight: "600",
              marginRight: "10px",
              whiteSpace: "nowrap",
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
            style={{
              flex: "1",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #444444",
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
              outline: "none",
            }}
          />
          <button
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={handleClick}
            style={{
              marginLeft: "10px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #444444",
              backgroundColor: "#333333",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {/* Profile Pic Input */}
        <div className="mb-3" style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="profilePic"
            className="form-label"
            style={{
              color: "#ffffff",
              fontWeight: "600",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
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
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#7e3ff2")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#6200EE")
          }
        >
          {isUploading ? "Uploading..." : "Signup"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
