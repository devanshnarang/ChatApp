import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
      setIsUploading(true);  // Start upload, disable submission if needed
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
            setPic(data.secure_url); // Set the image URL
          } else {
            alert("Image upload failed. Check the response data.");
            console.log("Response from Cloudinary:", data);
          }
          setIsUploading(false); // Upload finished
        })
        .catch((err) => {
          console.error("Error uploading image:", err);
          setIsUploading(false); // Even on error, stop the uploading state
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
    
    // Prevent submission if the image is still uploading
    if (isUploading) {
      alert("Please wait until the image upload is complete.");
      return;
    }
    
    // Optionally, check if pic is null and alert the user
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
        "/api/user/register",
        { name, email, password, pic, publicKey },
        config
      );
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
    <div>
      <form onSubmit={handleSubmit}>
        {/* Name Input */}
        <div className="mb-3">
          <label htmlFor="signupName" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="signupName"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {/* Email Input */}
        <div className="mb-3">
          <label htmlFor="signupEmail" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="signupEmail"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {/* Password Input */}
        <div className="mb-3 d-flex align-items-center">
          <label htmlFor="signupPassword" className="form-label">
            Password
          </label>
          <input
            type={show ? "text" : "password"}
            className="form-control form-control-sm"
            id="signupPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {/* Confirm Password Input */}
        <div className="mb-3 d-flex align-items-center">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type={show ? "text" : "password"}
            className="form-control form-control-sm"
            id="confirmPassword"
            placeholder="Confirm Password"
            value={confirmpassword}
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <button className="btn btn-sm btn-outline-secondary ms-2" onClick={handleClick}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {/* Profile Pic Input */}
        <div className="mb-3">
          <label htmlFor="profilePic" className="form-label">
            Profile Pic
          </label>
          <input
            type="file"
            className="form-control"
            id="profilePic"
            onChange={(e) => postDetails(e.target.files[0])}
          />
        </div>
        {/* Signup Button */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          onClick={submitHandler}
          disabled={isUploading}  // Disable button during upload
        >
          {isUploading ? "Uploading..." : "Signup"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
