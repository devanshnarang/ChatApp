import React, { useState } from "react";

const RecoveryKeyModal = ({ recoveryKey, onConfirm, onCancel }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopySuccess(true);
      // Hide the notification after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy the recovery key.", err);
    }
  };

  return (
    <div className="recovery-modal-overlay">
      <div className="recovery-modal-container">
        {/* Notification box for copy success */}
        {copySuccess && <div className="copy-notification">Copied to clipboard!</div>}
        <div className="recovery-modal-header">
          <h5>Your Recovery Key</h5>
          <button className="recovery-modal-close" onClick={onCancel}>
            &times;
          </button>
        </div>
        <div className="recovery-modal-body">
          <p>
            Please copy and save your recovery key. You will need it in the future to
            recover your chats.
          </p>
          <div className="input-group">
            <input
              type="text"
              className="recovery-key-input"
              value={recoveryKey}
              readOnly
            />
            <button className="copy-button" style={{color:"black"}} onClick={copyToClipboard}>
              Copy
            </button>
          </div>
        </div>
        <div className="recovery-modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Proceed Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecoveryKeyModal;
