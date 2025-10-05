import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import SuccessPopup from "../components/common/SuccessPopup";

// leaflet icons fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationPicker = ({ setForm }) => {
  const [marker, setMarker] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarker([lat, lng]);
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
        .then((res) => res.json())
        .then((data) => {
          setForm((prev) => ({
            ...prev,
            Location: data.display_name || `${lat},${lng}`,
          }));
        });
    },
  });

  return marker ? <Marker position={marker} /> : null;
};

const CreateStation = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    Name: "",
    Location: "",
    Type: "AC",
    Active: true,
  });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "success" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPopup({ message: "", type: "success" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chargingstation/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Failed to create station (${res.status})`);
      }

      await res.json();
      setPopup({ message: "Charging station created successfully!", type: "success" });
    } catch (e) {
      setPopup({ message: e.message || "Failed to create station", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setPopup({ message: "", type: "success" });
    if (popup.type === "success") {
      navigate("/dashboard/stations"); // go back only after success
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">Create Charging Station</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="Name"
              value={form.Name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Map + Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              name="Location"
              value={form.Location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
              placeholder="Search or click on the map"
              required
            />
            <MapContainer
              center={[6.9271, 79.8612]}
              zoom={12}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker setForm={setForm} />
            </MapContainer>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="Type"
              value={form.Type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="AC">AC</option>
              <option value="DC">DC</option>
            </select>
          </div>

          {/* Active */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="Active"
              checked={form.Active}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm">Active</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md transition"
          >
            {loading ? "Creating..." : "Create Station"}
          </button>
        </form>
      </div>

      {/* success/error popup */}
      <SuccessPopup
        message={popup.message}
        type={popup.type}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default CreateStation;
