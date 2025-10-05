import React, { useState } from "react";

const ConfirmInitModal = ({ stationId, onClose }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const handleConfirm = async () => {
    if (!selectedDate) {
      setErr("Please select a date.");
      return;
    }
    setLoading(true);
    setErr("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_API_BASE_URL}/chargingslot/init/${stationId}/${selectedDate}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`Failed (${res.status})`);

      // ✅ success: show message, close modal after 2s
      setSuccess("Time slots initialized successfully!");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      setErr(e.message || "Failed to initialize slots.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[2000]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-lg font-semibold mb-4">Initialize Time Slots</h2>

        {err && (
          <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md p-2">
            {err}
          </div>
        )}

        {success && (
          <div className="mb-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-md p-2">
            {success}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !!success}
            className="px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-indigo-300"
          >
            {loading ? "Initializing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmInitModal;
