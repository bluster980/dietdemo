import React from "react";
// eslint-disable-next-line no-unused-vars
import {motion,  AnimatePresence } from "framer-motion";
import "../styles/confirmdialogresponsive.css";

function ConfirmDialog({ isOpen, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="confirm-overlay"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="confirm-dialog"
          >
            <div className="confirm-content">
              <p className="confirm-title">Are you sure?</p>
              <p className="confirm-subtitle">This action cannot be undone</p>
            </div>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="confirm-btn confirm-btn-confirm" onClick={onConfirm}>
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
