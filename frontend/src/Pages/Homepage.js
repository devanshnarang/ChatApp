import React, { useEffect, useState } from "react";
import Login from "../components/Authentication/Login.js";
import Signup from "../components/Authentication/Signup.js";
import { useNavigate } from "react-router-dom";

const Homepage = () => {

  const navigate=useNavigate();

  useEffect(()=>{
    const user=JSON.parse(localStorage.getItem("userInfo"));
    if(user)navigate('/chats');
  },[navigate]);

  // State to toggle between Login and Signup forms
  const [isLogin, setIsLogin] = useState(false);

  // Toggle between Login and Signup
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="text-center mb-4">
                <button
                  onClick={toggleForm}
                  className="btn btn-outline-primary w-100 text-dark"
                >
                  {isLogin ? "Signup" : "Login"}
                </button>
              </div>
              <div>
                {isLogin ? <Login isLogin={isLogin} setIsLogin={setIsLogin}/> : <Signup isLogin={isLogin} setIsLogin={setIsLogin}/>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;