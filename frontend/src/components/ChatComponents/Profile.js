import React, { useEffect } from "react";

const Profile = ({ showModal, closeModal,user }) => {


  return (
    <>
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 4 }}
          ></div>
          {/* Modal */}
          <div
            className={`modal fade show`}
            tabIndex="-1"
            role="dialog"
            style={{ display: "block", zIndex: 4 }}
            aria-labelledby="exampleModalCenterTitle"
            aria-hidden="false"
          >
            <div className="modal-dialog modal-dialog-centered" role="document" style={{zIndex:3}}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLongTitle">
                    Profile
                  </h5>
                </div>
                <div className="modal-body d-flex flex-column align-self-stretch mb-2">
                  <div className="text-center">
                    <img
                      src={user?.pic}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="mt-3">
                    <p>
                      <strong>Name:</strong> {user?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user?.email}
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
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
      )}
    </>
  );
};

export default Profile;
