// src/components/common/SuccessPopup.jsx
import React from "react";

const SuccessPopup = ({ message, onClose, type = "success" }) => {
  if (!message) return null;

  const colors =
    type === "success"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-red-100 text-red-800 border-red-300";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[2000]">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* card */}
      <div
        className={`relative z-[2001] w-full max-w-sm p-5 rounded-lg shadow-lg border ${colors}`}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-lg font-semibold mb-2">
          {type === "success" ? "Success" : "Error"}
        </h3>
        <p className="text-sm">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;
