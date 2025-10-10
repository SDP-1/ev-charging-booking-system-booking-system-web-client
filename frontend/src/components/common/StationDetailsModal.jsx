
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XMarkIcon, PencilIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import ConfirmInitModal from './ConfirmInitModal';
import ConfirmModal from './ConfirmModal';
import SuccessPopup from './SuccessPopup';

// Fix leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const StationDetailsModal = ({
  station: propStation = null,
  stationId: propStationId = null,
  open = true,
  onClose = () => {},
  onUpdated = () => {},
}) => {
  const { stationId: routeId } = useParams();
  const [station, setStation] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [initStation, setInitStation] = useState(null);
  const [popup, setPopup] = useState({ message: '', type: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteDeps, setDeleteDeps] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  const currentId = propStationId ?? propStation?.id ?? routeId;

  // Fetch Station Details
  const fetchStation = async () => {
    if (!currentId) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${BASE}/chargingstation/${currentId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch station (${res.status})`);
      const data = await res.json();

      const lat = data.geoLocation?.latitude ?? null;
      const lon = data.geoLocation?.longitude ?? null;

      const cleanStation = { ...data, latitude: lat, longitude: lon };
      setStation(cleanStation);
      populateForm(cleanStation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data) => {
    setForm({
      name: data.name ?? '',
      address: data.address ?? '',
      latitude: data.latitude ?? '',
      longitude: data.longitude ?? '',
      type: data.type ?? 'AC',
      active: data.active ?? true,
      isPublic: data.isPublic ?? true,
      numberOfConnectors: data.numberOfConnectors ?? 1,
      connectorTypes: data.connectorTypes ?? [],
      operatingHours: data.operatingHours ?? '',
      phoneNumber: data.phoneNumber ?? '',
      email: data.email ?? '',
      amenities: data.amenities ?? [],
    });
  };

  useEffect(() => {
    if (propStation) {
      setStation(propStation);
      populateForm(propStation);
      setLoading(false);
    } else {
      fetchStation();
    }
  }, [propStationId, routeId]);

  // Handle Form Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      setForm((prev) => ({ ...prev, [name]: Number(value) || '' }));
    } else if (name === 'connectorTypes' || name === 'amenities') {
      setForm((prev) => ({ ...prev, [name]: value.split(',').map((v) => v.trim()) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  // Reverse Geocoding to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      }
      return 'Address not found';
    } catch (err) {
      console.error('Geocoding error:', err);
      return 'Failed to fetch address';
    }
  };

  // Handle Map Location Selection
  const handleLocationSelect = async (latlng) => {
    if (editing) {
      const newAddress = await reverseGeocode(latlng.lat, latlng.lng);
      setForm((prev) => ({
        ...prev,
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6),
        address: newAddress,
      }));
    }
  };

  // Save Station
  const handleSave = async () => {
    try {
      setLoading(true);

      // Build partial update DTO according to ChargingStationUpdateDto
      const updatedFields = {
        name: form.name,
        address: form.address,
        type: form.type,
        active: form.active,
        numberOfConnectors: form.numberOfConnectors,
        connectorTypes: form.connectorTypes,
        operatingHours: form.operatingHours,
        phoneNumber: form.phoneNumber,
        email: form.email,
        isPublic: form.isPublic,
        amenities: form.amenities,
      };

      if ((form.latitude !== undefined && form.latitude !== '') || (form.longitude !== undefined && form.longitude !== '')) {
        updatedFields.geoLocation = {
          latitude: form.latitude === '' || form.latitude === null ? null : Number(form.latitude),
          longitude: form.longitude === '' || form.longitude === null ? null : Number(form.longitude),
        };
      }

      const res = await fetch(`${BASE}/chargingstation/partial/${currentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Update failed (${res.status}) ${errBody}`);
      }

      setEditing(false);
      setPopup({ message: 'Station updated successfully', type: 'success' });
      await fetchStation();
      onUpdated?.();
    } catch (err) {
      setPopup({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Activate / Deactivate
  const handleStatus = async (action) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/chargingstation/${action}/${currentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Failed to ${action}`);

      setPopup({ message: `${action === 'activate' ? 'Activated' : 'Deactivated'} successfully`, type: 'success' });
      await fetchStation();
      onUpdated?.();
    } catch (err) {
      setPopup({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Delete flow: preview dependencies, then confirm delete
  const handleDelete = async (confirm = false) => {
    if (!currentId) return;
    try {
      setDeleting(true);
      setError('');
      const url = `${BASE}/chargingstation/delete/${currentId}${confirm ? '?confirm=true' : ''}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }

      if (res.ok) {
        setPopup({ message: data?.message ?? 'Station deleted successfully', type: 'success' });
        setShowDeleteConfirm(false);
        onUpdated?.();
        setTimeout(() => onClose?.(), 700);
        return;
      }

      if (res.status === 409 || (data && (data.dependencies || data.Dependencies || data.BookingsCount || data.SlotsCount))) {
        const deps = data?.Dependencies ?? data?.dependencies ?? data ?? null;
        setDeleteDeps(deps);
        setShowDeleteConfirm(true);
        return;
      }

      setPopup({ message: (data && (data.message || data.Message)) || `Delete failed (${res.status})`, type: 'error' });
    } catch (err) {
      setPopup({ message: err.message, type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = async () => {
    await handleDelete(true);
  };

  const lat = editing ? form.latitude : station?.latitude;
  const lon = editing ? form.longitude : station?.longitude;

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-green-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-green-50">
          <h2 className="text-2xl font-bold text-gray-900">{station?.name ?? 'Charging Station'}</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-green-200 transition-colors"
            aria-label="Close station details modal"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-100">
          {/* Loading State */}
          {loading && !station && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading station details...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center"
            >
              <XCircleIcon className="h-5 w-5 mr-2" />
              {error}
            </motion.div>
          )}

          {/* Station Content */}
          {station && (
            <>
              {/* Status and Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between"
              >
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${
                    station.active
                      ? 'bg-green-100 text-green-800 ring-green-600/20'
                      : 'bg-red-100 text-red-800 ring-red-600/20'
                  }`}
                  aria-label={`Station status: ${station.active ? 'Active' : 'Inactive'}`}
                >
                  {station.active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center gap-3">
                  {!editing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors shadow-sm"
                      aria-label="Edit station details"
                    >
                      <PencilIcon className="h-5 w-5" />
                      Edit
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatus(station.active ? 'deactivate' : 'activate')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                      station.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    aria-label={station.active ? 'Deactivate station' : 'Activate station'}
                  >
                    {station.active ? (
                      <>
                        <XCircleIcon className="h-5 w-5" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        Activate
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors shadow-sm"
                    disabled={deleting}
                    aria-label="Delete station"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>

              {/* Map */}
              {lat && lon && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-80 rounded-xl overflow-hidden shadow-md border border-green-200"
                >
                  <MapContainer center={[lat, lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[lat, lon]}>
                      <Popup>{station.name}</Popup>
                    </Marker>
                    {editing && <MapClickHandler onLocationSelect={handleLocationSelect} />}
                  </MapContainer>
                  {editing && (
                    <p className="mt-2 text-sm text-green-600 text-center">
                      Click on the map to update location
                    </p>
                  )}
                </motion.div>
              )}

              {/* Station Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="mt-1 text-gray-900" aria-label="Station address">{station.address ?? '—'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="mt-1 text-gray-900" aria-label="Station type">{station.type ?? '—'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                  <p className="mt-1 text-gray-900" aria-label="Station contact">
                    {station.phoneNumber} {station.phoneNumber && station.email && '•'} {station.email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Operating Hours</h3>
                  <p className="mt-1 text-gray-900" aria-label="Operating hours">{station.operatingHours ?? '—'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Connectors</h3>
                  <p className="mt-1 text-gray-900" aria-label="Connectors">
                    {station.numberOfConnectors} ({station.connectorTypes?.join(', ') ?? '—'})
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amenities</h3>
                  <p className="mt-1 text-gray-900" aria-label="Amenities">{station.amenities?.join(', ') ?? '—'}</p>
                </div>
              </motion.div>

              {/* Edit Form */}
              {editing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-6 bg-green-50 rounded-xl space-y-4 border border-green-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Edit Station</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="name">Name</label>
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 transition duration-200"
                        aria-label="Station name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="address">Address</label>
                      <input
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 transition duration-200"
                        aria-label="Station address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="latitude">Latitude</label>
                        <input
                          id="latitude"
                          name="latitude"
                          value={form.latitude}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 transition duration-200"
                          aria-label="Station latitude"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="longitude">Longitude</label>
                        <input
                          id="longitude"
                          name="longitude"
                          value={form.longitude}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 transition duration-200"
                          aria-label="Station longitude"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="connectorTypes">Connector Types</label>
                      <input
                        id="connectorTypes"
                        name="connectorTypes"
                        value={form.connectorTypes.join(', ')}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 transition duration-200"
                        aria-label="Connector types"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="amenities">Amenities</label>
                      <input
                        id="amenities"
                        name="amenities"
                        value={form.amenities.join(', ')}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 transition duration-200"
                        aria-label="Amenities"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className="flex-1 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition-colors shadow-sm disabled:bg-green-400 disabled:cursor-not-allowed"
                      disabled={loading}
                      aria-label="Save station changes"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditing(false)}
                      className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 hover:bg-gray-300 transition-colors shadow-sm"
                      aria-label="Cancel editing"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-green-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 hover:bg-gray-300 transition-colors shadow-sm"
            aria-label="Close modal"
          >
            Close
          </motion.button>
        </div>

        <ConfirmModal
          isOpen={showDeleteConfirm}
          title={`Delete station "${station?.name ?? ''}"?`}
          isError={true}
          message={
            deleteDeps
              ? `This station has ${deleteDeps.bookingsCount ?? deleteDeps.BookingsCount ?? deleteDeps.BookingsDeleted ?? 0} bookings and ${deleteDeps.slotsCount ?? deleteDeps.SlotsCount ?? deleteDeps.SlotsDeleted ?? 0} slots. Deleting will remove all related data. Are you sure you want to proceed?`
              : 'This station has dependent bookings or slots. Deleting will remove all related data. Are you sure you want to proceed?'
          }
          confirmText={deleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
        />

        {initStation && <ConfirmInitModal stationId={initStation} onClose={() => setInitStation(null)} />}
        <SuccessPopup message={popup.message} type={popup.type} onClose={() => setPopup({ message: '', type: 'success' })} />
      </div>
    </motion.div>
  );
};

export default StationDetailsModal;