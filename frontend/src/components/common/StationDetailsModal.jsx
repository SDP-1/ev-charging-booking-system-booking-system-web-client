import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
        // include string values (can be null/empty if intentionally cleared)
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

      // Only include geoLocation if there's at least one coordinate
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

      const respJson = await res.json();

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteDeps, setDeleteDeps] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

      // Try to parse json body if any
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
        // Close modal after short delay so user sees popup
        setTimeout(() => onClose?.(), 700);
        return;
      }

      // If backend signals dependencies (preview) use that to show confirm modal
      if (res.status === 409 || (data && (data.dependencies || data.Dependencies || data.BookingsCount || data.SlotsCount))) {
        const deps = data?.Dependencies ?? data?.dependencies ?? data ?? null;
        setDeleteDeps(deps);
        setShowDeleteConfirm(true);
        return;
      }

      // Otherwise show error
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900">{station?.name ?? 'Charging Station'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Loading State */}
          {loading && !station && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading station details...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* Station Content */}
          {station && (
            <>
              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium ${
                    station.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {station.active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center gap-3">
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleStatus(station.active ? 'deactivate' : 'activate')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      station.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
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
                  </button>
                  <button
                    onClick={() => handleDelete(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    disabled={deleting}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Map */}
              {lat && lon && (
                <div className="h-80 rounded-xl overflow-hidden shadow-lg">
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
                    <p className="mt-2 text-sm text-gray-600 text-center">
                      Click on the map to update location
                    </p>
                  )}
                </div>
              )}

              {/* Station Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="mt-1 text-gray-900">{station.address ?? '—'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="mt-1 text-gray-900">{station.type ?? '—'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                  <p className="mt-1 text-gray-900">
                    {station.phoneNumber} {station.phoneNumber && station.email && '•'} {station.email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Operating Hours</h3>
                  <p className="mt-1 text-gray-900">{station.operatingHours ?? '—'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Connectors</h3>
                  <p className="mt-1 text-gray-900">
                    {station.numberOfConnectors} ({station.connectorTypes?.join(', ') ?? '—'})
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amenities</h3>
                  <p className="mt-1 text-gray-900">{station.amenities?.join(', ') ?? '—'}</p>
                </div>
              </div>

              {/* Edit Form */}
              {editing && (
                <div className="mt-6 p-6 bg-gray-50 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Station</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input
                          name="latitude"
                          value={form.latitude}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Longitude</label>
                        <input
                          name="longitude"
                          value={form.longitude}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Connector Types</label>
                      <input
                        name="connectorTypes"
                        value={form.connectorTypes.join(', ')}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amenities</label>
                      <input
                        name="amenities"
                        value={form.amenities.join(', ')}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
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
    </div>
  );
};

export default StationDetailsModal;