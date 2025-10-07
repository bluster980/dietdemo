import React from "react";

export default function DesignFrame({ children }) {
  return (
    <div className="df-viewport">
      <div className="df-canvas">
        {children}
      </div>
    </div>
  );
}