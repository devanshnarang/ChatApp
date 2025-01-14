import React, { useState } from "react";
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState(null);
  const navigate = useNavigate();

  const postDetails = (pics) => {
    if (!pics) {
      alert("Please select a profile picture.");
      return;
    }
  
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chatap"); // Replace with your actual upload preset
      data.append("cloud_name", "dmwwxqq1l"); // Replace with your Cloudinary cloud name
  
      fetch("https://api.cloudinary.com/v1_1/dmwwxqq1l/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.secure_url) {
            setPic(data.secure_url); // Use secure_url instead of url
          } else {
            alert("Image upload failed. Check the response data.");
            console.log("Response from Cloudinary:", data);
          }
        })
        .catch((err) => {
          console.error("Error uploading image:", err);
        });
    } else {
      alert("Invalid image type. Please upload a JPEG or PNG image.");
    }
  };

  const submitHandler=async()=>{
    if(!name || !email || !password || !pic){
      alert("Please fill all the details");
      return;
    }
    if(password!==confirmpassword){
      alert("Password and Confirm Password fields don't match!");
      return;
    }
    try {
      const config = {
        headers:{
          "Content-type":"application/json",
        },
      };
      const {data} = await axios.post("/api/user/register",{name,email,password,pic},config);
      navigate("/login");
    } catch (error) {
      console.log("An error occured");
      console.log(error.message);
    }
  }
  

  const handleClick = (e) => {
    e.preventDefault(); // Prevent the button from submitting the form
    setShow(!show);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" className="btn btn-primary w-100" onClick={submitHandler}>
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;