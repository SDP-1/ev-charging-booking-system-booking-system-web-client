
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConfirmInitModal from "../components/common/ConfirmInitModal";
import StationDetailsModal from "../components/common/StationDetailsModal";
import { BoltIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🧭 Custom green marker icon
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ChargingStations = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [initStation, setInitStation] = useState(null);
  const [modalStation, setModalStation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [popup, setPopup] = useState({ message: '', type: 'success' });
  const [showMap, setShowMap] = useState(false);

  const totalStations = stations.length;
  const activeStations = stations.filter(s => s.active).length;
  const inactiveStations = totalStations - activeStations;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const url = `${import.meta.env.VITE_API_BASE_URL}/chargingstation/all`;

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch stations (${res.status})`);
        const data = await res.json();
        if (mounted) {
          console.log("Stations data:", data);
          setStations(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (mounted) setErr(e.message || 'Failed to load stations.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const goCreate = () => navigate('/dashboard/stations/create');
  const goDetails = (id) => navigate(`/dashboard/stations/${id}`);
  const goBook = (id) => navigate(`/dashboard/stations/${id}/book`);

  const openDetailsModal = (stationId) => {
    setModalStation(stationId);
    setShowModal(true);
  };

  const handleModalUpdated = (updatedStation) => {
    setStations((prev) =>
      prev.map((p) =>
        p.id === (updatedStation.id || updatedStation._id || updatedStation.Id)
          ? updatedStation
          : p
      )
    );
    setPopup({ message: 'Station updated', type: 'success' });
  };

  // ✅ Extract and validate geo coordinates from `geoLocation`
  const validStations = stations.filter(
    (s) =>
      s.geoLocation &&
      s.geoLocation.latitude &&
      s.geoLocation.longitude &&
      !isNaN(Number(s.geoLocation.latitude)) &&
      !isNaN(Number(s.geoLocation.longitude))
  );

  // ✅ Compute map center
  const center =
    validStations.length > 0
      ? [
          validStations.reduce((a, b) => a + parseFloat(b.geoLocation.latitude), 0) /
          validStations.length,
          validStations.reduce((a, b) => a + parseFloat(b.geoLocation.longitude), 0) /
          validStations.length,
        ]
      : [7.8731, 80.7718]; // Default center: Sri Lanka

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stations...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-green-50 p-4 rounded-xl shadow-md border border-green-200">
        <div className="flex items-center gap-3">
          <BoltIcon className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">Charging Stations</h1>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goCreate}
            className="px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Create a new charging station"
          >
            + Create Station
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMap((prev) => !prev)}
            className="px-6 py-3 rounded-xl bg-green-100 text-green-700 font-medium hover:bg-green-200 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label={showMap ? 'Close map view' : 'Open map view'}
          >
            {showMap ? 'Close Map' : 'Map View'}
          </motion.button>
        </div>
      </div>

      {/* Stats Section */}
      {!err && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="bg-white rounded-xl p-6 shadow-md border border-green-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stations</p>
                <p className="text-2xl font-bold text-gray-800">{totalStations}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="bg-white rounded-xl p-6 shadow-md border border-green-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <BoltIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Stations</p>
                <p className="text-2xl font-bold text-gray-800">{activeStations}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="bg-white rounded-xl p-6 shadow-md border border-red-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100 text-red-600">
                <MapPinIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Stations</p>
                <p className="text-2xl font-bold text-gray-800">{inactiveStations}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 🗺️ Inline Map Section */}
      {showMap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-[500px] mb-10 rounded-xl overflow-hidden shadow-md border border-green-200"
        >
          <MapContainer center={center} zoom={9} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validStations.map((s) => (
              <Marker
                key={s.id}
                position={[
                  parseFloat(s.geoLocation.latitude),
                  parseFloat(s.geoLocation.longitude),
                ]}
                icon={greenIcon}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-sm text-gray-600 mb-2">{s.address || "—"}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goDetails(s.id)}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 shadow-sm"
                      aria-label={`View details for ${s.name}`}
                    >
                      View Details
                    </motion.button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>
      )}

      {/* ⚡ Station Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-100">
        {stations.map((s, index) => (
          <motion.div
            key={s.id ?? s._id ?? s.Id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-xl border border-green-200 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 truncate">{s.name}</h3>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {s.address || s.location || '—'}
                </p>
              </div>
              <span
                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${
                  s.active
                    ? 'bg-green-100 text-green-800 ring-green-600/20'
                    : 'bg-red-100 text-red-800 ring-red-600/20'
                }`}
                aria-label={`Station status: ${s.active ? 'Active' : 'Inactive'}`}
              >
                {s.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BoltIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Charger Type</p>
                  <p className="text-sm font-semibold text-gray-900">{s.type || '—'}</p>
                </div>
              </div>

              {(s.connectorTypes && s.connectorTypes.length > 0) && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPinIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Connectors</p>
                    <p className="text-sm font-semibold text-gray-900">{s.connectorTypes.join(', ')}</p>
                  </div>
                </div>
              )}

              {(s.phoneNumber || s.email) && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 10v6a2 2 0 0 1-2 2H9l-4 2V6a2 2 0 0 1 2-2h11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Contact</p>
                    <p className="text-sm font-semibold text-gray-900">{s.phoneNumber || ''}{s.phoneNumber && s.email ? ' • ' : ''}{s.email || ''}</p>
                  </div>
                </div>
              )}

              {(s.amenities && s.amenities.length > 0) && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 7h18M3 12h18M3 17h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Amenities</p>
                    <p className="text-sm font-semibold text-gray-900">{s.amenities.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goBook(s.id ?? s._id ?? s.Id)}
                disabled={!s.active}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm ${
                  s.active ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                aria-label={s.active ? `Book a slot at ${s.name}` : `Booking unavailable for ${s.name}`}
              >
                {s.active ? 'Book Slot' : 'Unavailable'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openDetailsModal(s.id ?? s._id ?? s.Id)}
                className="px-4 py-3 rounded-xl bg-green-100 text-green-700 font-medium hover:bg-green-200 transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label={`View details for ${s.name}`}
              >
                Details
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInitStation(s.id ?? s._id ?? s.Id)}
                disabled={!s.active}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm ${
                  s.active ? 'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-md' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                aria-label={s.active ? `Initialize ${s.name}` : `Initialization disabled for ${s.name}`}
              >
                {s.active ? 'Initialize' : 'Disabled'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && modalStation && (
        <StationDetailsModal
          stationId={modalStation}
          onClose={() => setShowModal(false)}
          onUpdated={handleModalUpdated}
        />
      )}
      {initStation && (
        <ConfirmInitModal
          stationId={initStation}
          onClose={() => setInitStation(null)}
          onConfirm={() => setInitStation(null)}
        />
      )}
    </motion.div>
  );
};

export default ChargingStations;