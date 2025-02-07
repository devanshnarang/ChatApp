import React, { useState } from "react";
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {ChatState} from "../../Context/ChatProvider.js";

const Login = ({isLogin,setIsLogin}) => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const {setUser} = ChatState();


  const submitHandler=async()=>{
    if(!email || !password){
      alert("Please fill all the details");
      return;
    }
    try {
      const config = {
        headers:{
          "Content-type":"application/json",
        },
      };
      const {data} = await axios.post("/api/user/login",{email,password},config);
      setUser(data);
      localStorage.setItem('userInfo',JSON.stringify(data));
      navigate("/backup");
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
          <button className="btn btn-sm btn-outline-secondary ms-2" onClick={handleClick}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <button type="submit" className="btn btn-primary w-100" onClick={submitHandler}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;