import React, { useEffect, useState } from "react";

const Profile = ({ showModal, closeModal, user }) => {
  // Control modal width based on viewport size:
  const [modalWidth, setModalWidth] = useState("90vw");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setModalWidth("500px");
      } else {
        setModalWidth("90vw");
      }
    };
    // Set the initial modal width
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!showModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040,height:"100px" }}
      ></div>
      {/* Modal Container */}
      <div
        className="modal fade show"
        tabIndex="-1"
        role="dialog"
        style={{
          display: "block",
          zIndex: 1050,
          position: "fixed",
          top: "50%",
          left: "50%",  // Correct centering: left should be 50%
          transform: "translate(-50%, -50%)",
          width: modalWidth,
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxSizing: "border-box",
          padding: "10px", // Extra padding to ensure gap on the right
          height:"50vh",
          border:"5px solid white",
          backgroundColor:"rgb(85,85,85)"
        }}
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="false"
      >
        <div 
          className="modal-dialog modal-dialog-centered" 
          role="document"
          style={{ margin: "0 auto",border:"none",backgroundColor:"rgb(85,85,85)" }}
        >
          <div className="modal-content" style={{backgroundColor:"rgb(85,85,85)"}}>
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLongTitle">
                Profile
              </h5>
            </div>
            <div className="modal-body d-flex flex-column align-self-stretch mb-2" style={{backgroundColor:"rgb(85,85,85)"}}>
              <div className="text-center" style={{backgroundColor:"rgb(85,85,85)"}}>
                <img
                  src={user?.pic}
                  alt="Profile"
                  className="rounded-circle"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    backgroundColor:"rgb(85,85,85)"
                  }}
                />
              </div>
              <div className="mt-3" style={{backgroundColor:"rgb(85,85,85)"}}>
                <p style={{backgroundColor:"rgb(85,85,85)"}}>
                  <strong style={{backgroundColor:"rgb(85,85,85)"}}>Name:</strong> {user?.name}
                </p>
                <p style={{backgroundColor:"rgb(85,85,85)"}}>
                  <strong style={{backgroundColor:"rgb(85,85,85)"}}>Email:</strong> {user?.email}
                </p>
              </div>
            </div>
            <div className="modal-footer" style={{backgroundColor:"rgb(85,85,85)"}}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
