
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import useDebounce from '../../hooks/useDebounce';

const BookSlotModal = ({ slot, onConfirm, onClose, isLoading = false }) => {
  const [error, setError] = useState('');
  const [nicQuery, setNicQuery] = useState('');
  const debouncedNic = useDebounce(nicQuery, 400);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);

  const BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  const [isBackoffice, setIsBackoffice] = useState(false);

  // Detect if the logged-in user has Backoffice role by decoding JWT payload (best-effort)
  useEffect(() => {
    if (!token) return setIsBackoffice(false);
    try {
      const parts = token.split('.');
      if (parts.length < 2) return setIsBackoffice(false);
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      // roles may be in 'role', 'roles' or in claim with namespace
      const roles = payload.role || payload.roles || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (!roles) return setIsBackoffice(false);
      if (Array.isArray(roles)) setIsBackoffice(roles.includes('Backoffice'));
      else setIsBackoffice(String(roles).includes('Backoffice'));
    } catch (e) {
      setIsBackoffice(false);
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;
    const fetchSuggestions = async () => {
      if (!debouncedNic || debouncedNic.trim().length === 0) {
        setSuggestions([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const q = encodeURIComponent(debouncedNic.trim());
        const res = await fetch(`${BASE}/evowner/search?q=${q}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          // don't crash the UI on search failure
          setSuggestions([]);
          return;
        }
        const data = await res.json();
        if (mounted) setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (e) {
        setSuggestions([]);
      } finally {
        if (mounted) setSearching(false);
      }
    };

    fetchSuggestions();

    return () => {
      mounted = false;
    };
  }, [debouncedNic]);

  const handleBook = async () => {
    try {
      setError('');
      if (!selectedUser) {
        setError('Please select an EV owner before confirming.');
        return;
      }
      // Attach user info to slot or pass to onConfirm as needed
      await onConfirm({ ...slot, userId: selectedUser.id || selectedUser._id || selectedUser.Id, user: selectedUser });
      onClose();
    } catch (e) {
      setError(e.message || 'Booking failed. Please try again.');
    }
  };

  const toLocal = (iso) =>
    new Date(iso).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-md transition-all sm:my-8 sm:w-full sm:max-w-md border-t-4 border-green-500">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Confirm Booking</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Book slot: {toLocal(slot.startTime)} → {toLocal(slot.endTime)}
                  </p>
                </div>
                {/* NIC search */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search EV Owner by NIC</label>
                  <input
                    type="search"
                    value={nicQuery}
                    onChange={(e) => {
                      setNicQuery(e.target.value);
                      setSelectedUser(null);
                    }}
                    placeholder="Type NIC fragment..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    aria-label="Search EV owner by NIC"
                  />

                  {/* suggestions dropdown */}
                  {debouncedNic && (
                    <div className="mt-2 max-h-56 overflow-auto bg-white border border-gray-200 rounded-md shadow-sm">
                      {searching && <div className="p-2 text-sm text-gray-500">Searching...</div>}
                      {!searching && suggestions.length === 0 && (
                        <div className="p-2 text-sm text-gray-500">No users found</div>
                      )}
                      {!searching && suggestions.slice(0, 5).map((u) => (
                        <button
                          key={u.id || u._id || u.Id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setNicQuery(u.nic || u.NIC || u.NICNumber || '');
                            setSuggestions([]);
                          }}
                          className="w-full text-left p-2 hover:bg-gray-50"
                        >
                          <div className="text-sm font-medium text-gray-800">{u.username || u.Username || u.userName || u.fullName || u.name || `${u.firstName || ''} ${u.lastName || ''}`}</div>
                          <div className="text-xs text-gray-500">NIC: {u.nic || u.NIC || u.NICNumber || '—'}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* selected user details */}
                  {selectedUser && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-md">
                      <div className="text-sm text-gray-700">Selected EV Owner</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">{selectedUser.username || selectedUser.Username || selectedUser.userName || selectedUser.fullName || selectedUser.name || `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`}</div>
                      <div className="text-sm text-gray-600">NIC: {selectedUser.nic || selectedUser.NIC || selectedUser.NICNumber || '—'}</div>
                      {selectedUser.email && <div className="text-sm text-gray-600">Email: {selectedUser.email}</div>}
                      {selectedUser.phoneNumber && <div className="text-sm text-gray-600">Phone: {selectedUser.phoneNumber}</div>}
                    </div>
                  )}
                </div>
                {error && (
                  <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              disabled={isLoading || (isBackoffice && !selectedUser)}
              onClick={handleBook}
              className="inline-flex w-full justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Confirm booking"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Confirm
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              aria-label="Cancel booking"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookSlotModal;