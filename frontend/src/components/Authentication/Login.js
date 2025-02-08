import React, { useState } from "react";
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
      // const { data } = await axios.post("https://chatapp-5os8.onrender.com/api/user/login", { email, password }, config);
      const { data } = await axios.post("https://chatapp-5os8.onrender.com/api/user/login", { email, password }, config);
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/backup");
    } catch (error) {
      console.log("An error occured");
      console.log(error.message);
    }
  };

  const handleClick = (e) => {
    e.preventDefault(); // Prevent the button from submitting the form
    setShow(!show);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #000000, #1a1a1a)",
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "rgba(30, 30, 30, 0.9)",
          padding: "20px",
          borderRadius: "12px",
          width: "100%",
          height: "90%",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="mb-3" style={{ marginBottom: "1rem",display:"flex",flexDirection:"row",justifyContent:"space around" }}>
          <label
            htmlFor="signupEmail"
            className="form-label"
            style={{
              color: "#ffffff",
              fontWeight: "600",
              marginBottom: "0.5rem",
              display: "block",
              width:"30%"
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
              width:"22%"
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
