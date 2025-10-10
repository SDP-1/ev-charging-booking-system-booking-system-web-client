import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import BookSlotModal from '../components/station/BookSlotModal';
import DeleteSlotModal from '../components/station/DeleteSlotModal';
import RemoveAllSlotsModal from '../components/station/RemoveAllSlotsModal';

const fmtDate = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const StationSlots = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => fmtDate(new Date()));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showBookModal, setShowBookModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showRemoveAllModal, setShowRemoveAllModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const url = useMemo(() => `${BASE}/chargingslot/all/${stationId}/${selectedDate}`, [BASE, stationId, selectedDate]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setErr('');
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch slots (${res.status})`);
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || 'Failed to load slots.');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stationId) fetchSlots();
  }, [stationId, selectedDate]);

  const changeDay = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(fmtDate(d));
  };

  const visible = useMemo(() => (onlyAvailable ? slots.filter((s) => !s.isBooked) : slots), [slots, onlyAvailable]);

  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => !s.isBooked).length;
  const bookedSlots = totalSlots - availableSlots;

  const toLocal = (iso) =>
    new Date(iso).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  const handleBookSlot = async (slot) => {
    setModalLoading(true);
    try {
      const res = await fetch(`${BASE}/booking/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          StationId: slot.stationId,
          SlotId: slot.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.title || `Booking failed (${res.status})`);
      }
      fetchSlots();
      setShowBookModal(null);
    } catch (e) {
      throw e;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    setModalLoading(true);
    try {
      await fetch(`${BASE}/chargingslot/${slotId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSlots();
    } catch {
      throw new Error('Failed to delete slot');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRemoveAllSlots = async () => {
    setModalLoading(true);
    try {
      await fetch(`${BASE}/chargingslot/deinit/${stationId}/${selectedDate}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSlots();
    } catch {
      throw new Error('Failed to remove all slots');
    } finally {
      setModalLoading(false);
    }
  };

  const renderSkeletonCard = () => (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-12 bg-gray-200 rounded mb-4"></div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
        <div className="h-10 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading slots...</p>
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
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition shadow-sm"
              aria-label="Go back to previous page"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </motion.button>
            <div className="flex items-center gap-3">
              <BuildingOffice2Icon className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Station Slots</h1>
                <p className="text-sm text-gray-600">ID: {stationId}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-md border border-green-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeDay(-1)}
              className="p-2 rounded-lg hover:bg-green-100 text-green-700 transition"
              title="Previous day"
              aria-label="View slots for previous day"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </motion.button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-0 bg-transparent px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg transition"
                aria-label="Select date for slots"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeDay(1)}
              className="p-2 rounded-lg hover:bg-green-100 text-green-700 transition"
              title="Next day"
              aria-label="View slots for next day"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </motion.button>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-green-100 px-3 py-1.5 rounded-lg">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="accent-green-500 rounded"
                aria-label="Show only available slots"
              />
              Only available
            </label>
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
                  <ClockIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Slots</p>
                  <p className="text-2xl font-bold text-gray-800">{totalSlots}</p>
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
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-800">{availableSlots}</p>
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
                  <XCircleIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Booked</p>
                  <p className="text-2xl font-bold text-gray-800">{bookedSlots}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRemoveAllModal(true)}
            className="px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition shadow-md"
            aria-label="Remove all slots for selected date"
          >
            <XCircleIcon className="h-5 w-5 inline mr-2" />
            Remove All Slots
          </motion.button>
        </div>

        {/* Content */}
        <div className="pb-10 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-100">
          {err && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg shadow-md"
            >
              <XCircleIcon className="h-5 w-5 inline mr-2" />
              {err}
            </motion.div>
          )}

          {!loading && !err && visible.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl shadow-md border border-green-200"
            >
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No slots available</h3>
              <p className="text-gray-600">
                No {onlyAvailable ? 'available' : ''} slots found for <strong>{selectedDate}</strong>. Try another date or initialize slots.
              </p>
            </motion.div>
          )}

          {visible.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative bg-white rounded-xl p-6 shadow-md border border-green-200 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-sm font-mono text-gray-600 truncate" title={s.id}>
                      {s.id}
                    </p>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ring-1 ring-inset ${
                        s.isBooked
                          ? 'bg-red-100 text-red-800 ring-red-600/20'
                          : 'bg-green-100 text-green-800 ring-green-600/20'
                      }`}
                      aria-label={`Slot status: ${s.isBooked ? 'Booked' : 'Available'}`}
                    >
                      {s.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <ClockIcon className="h-5 w-5 text-green-600" />
                      {toLocal(s.startTime)} → {toLocal(s.endTime)}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={s.isBooked}
                      onClick={() => setShowBookModal(s)}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition shadow-sm ${
                        s.isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      aria-label={s.isBooked ? 'Slot booked' : 'Book this slot'}
                    >
                      {s.isBooked ? 'N/A' : 'Book Now'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteModal({ id: s.id, time: `${toLocal(s.startTime)} → ${toLocal(s.endTime)}` })}
                      className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition shadow-sm"
                      aria-label="Delete this slot"
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Modals */}
          {showBookModal && (
            <BookSlotModal
              slot={showBookModal}
              onConfirm={handleBookSlot}
              onClose={() => setShowBookModal(null)}
              isLoading={modalLoading}
            />
          )}
          {showDeleteModal && (
            <DeleteSlotModal
              slotId={showDeleteModal.id}
              slotTime={showDeleteModal.time}
              onConfirm={handleDeleteSlot}
              onClose={() => setShowDeleteModal(null)}
              isLoading={modalLoading}
            />
          )}
          {showRemoveAllModal && (
            <RemoveAllSlotsModal
              date={selectedDate}
              onConfirm={handleRemoveAllSlots}
              onClose={() => setShowRemoveAllModal(false)}
              isLoading={modalLoading}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StationSlots;