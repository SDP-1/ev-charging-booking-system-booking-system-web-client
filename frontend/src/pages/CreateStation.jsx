
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import SuccessPopup from "../components/common/SuccessPopup";

// 🧭 Custom green marker icon
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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
            Address: data.display_name || `${lat},${lng}`,
            GeoLocation: { Latitude: lat, Longitude: lng },
          }));
        })
        .catch(() => {
          setForm((prev) => ({
            ...prev,
            Address: `${lat},${lng}`,
            GeoLocation: { Latitude: lat, Longitude: lng },
          }));
        });
    },
  });

  return marker ? <Marker position={marker} icon={greenIcon} /> : null;
};

const CreateStation = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    Name: "",
    Address: "",
    GeoLocation: { Latitude: null, Longitude: null },
    Type: "AC",
    Active: true,
    NumberOfConnectors: 1,
    ConnectorTypes: [],
    OperatingHours: "",
    PhoneNumber: "",
    Email: "",
    IsPublic: true,
    Amenities: [],
  });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "success" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // handle nested GeoLocation numeric inputs
    if (name === 'Latitude' || name === 'Longitude') {
      const num = value === '' ? null : Number(value);
      setForm((prev) => ({
        ...prev,
        GeoLocation: {
          ...prev.GeoLocation,
          [name === 'Latitude' ? 'Latitude' : 'Longitude']: num,
        },
      }));
      return;
    }

    // comma-separated lists for connectors/amenities
    if (name === 'ConnectorTypes' || name === 'Amenities') {
      const arr = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      setForm((prev) => ({ ...prev, [name]: arr }));
      return;
    }

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
      navigate("/dashboard/stations");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6"
    >
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⚡️</span>
          <h1 className="text-3xl font-bold text-green-600">Create Charging Station</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="Name"
              value={form.Name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              required
              aria-label="Charging station name"
            />
          </motion.div>

          {/* Map + Address + GeoLocation */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="Address"
              value={form.Address}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Search or click on the map"
              required
              aria-label="Charging station address"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <input
                type="number"
                step="any"
                name="Latitude"
                value={form.GeoLocation?.Latitude ?? ''}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                placeholder="Latitude"
                aria-label="Latitude coordinate"
              />
              <input
                type="number"
                step="any"
                name="Longitude"
                value={form.GeoLocation?.Longitude ?? ''}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                placeholder="Longitude"
                aria-label="Longitude coordinate"
              />
            </div>
            <div className="h-[300px] rounded-lg overflow-hidden shadow-md border-t-4 border-green-500">
              <MapContainer
                center={[6.9271, 79.8612]}
                zoom={12}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker setForm={setForm} />
              </MapContainer>
            </div>
          </motion.div>

          {/* Type */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="Type"
              value={form.Type}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              aria-label="Charger type"
            >
              <option value="AC">AC</option>
              <option value="DC">DC</option>
            </select>
          </motion.div>

          {/* Number of connectors & Connector types */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Connectors</label>
            <input
              type="number"
              name="NumberOfConnectors"
              min={1}
              value={form.NumberOfConnectors}
              onChange={(e) => setForm((p) => ({ ...p, NumberOfConnectors: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              aria-label="Number of connectors"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Connector Types (comma separated)</label>
            <input
              type="text"
              name="ConnectorTypes"
              value={(form.ConnectorTypes || []).join(', ')}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Type2, CHAdeMO"
              aria-label="Connector types"
            />
          </motion.div>

          {/* Contact & meta fields */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
            <input
              type="text"
              name="OperatingHours"
              value={form.OperatingHours}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="e.g. 08:00 - 22:00"
              aria-label="Operating hours"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            <input
              type="text"
              name="PhoneNumber"
              value={form.PhoneNumber}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Phone number"
              aria-label="Contact phone number"
            />
            <input
              type="email"
              name="Email"
              value={form.Email}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Contact email"
              aria-label="Contact email"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
            <input
              type="text"
              name="Amenities"
              value={(form.Amenities || []).join(', ')}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Restroom, Cafe, Parking"
              aria-label="Amenities"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="flex items-center"
          >
            <input
              type="checkbox"
              name="IsPublic"
              checked={form.IsPublic}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              aria-label="Publicly accessible"
            />
            <label className="text-sm font-medium text-gray-700">Publicly Accessible</label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="flex items-center"
          >
            <input
              type="checkbox"
              name="Active"
              checked={form.Active}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              aria-label="Active status"
            />
            <label className="text-sm font-medium text-gray-700">Active</label>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 px-4 font-medium transition-all duration-200 shadow-sm ${
              loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
            }`}
            aria-label={loading ? 'Creating station' : 'Create charging station'}
          >
            {loading ? 'Creating...' : 'Create Station'}
          </motion.button>
        </form>
      </div>

      {/* success/error popup */}
      {popup.message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            popup.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}
        >
          <p>{popup.message}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClosePopup}
            className="mt-2 px-3 py-1 bg-white rounded-lg text-sm font-medium hover:bg-gray-50"
            aria-label="Close popup"
          >
            Close
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CreateStation;