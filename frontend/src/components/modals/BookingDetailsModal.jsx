// src/components/modals/BookingDetailsModal.jsx
import React from 'react';
import { HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import StatusPill from '../common/StatusPill';

const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const getStatus = (b) => {
    if (b.canceled) return 'Canceled';
    if (b.completed) return 'Completed';
    if (b.confirmed) return 'Confirmed';
    if (b.approved) return 'Approved';
    return 'Pending';
  };

  const currentStatus = getStatus(booking);
  const reservationTime = new Date(booking.reservationDateTime);
  const now = new Date();
  const timeDiffMs = reservationTime - now;
  const isFutureReservation = timeDiffMs > 0;
  const hoursUntilReservation = timeDiffMs / (1000 * 60 * 60);

  // Status steps configuration with descriptions
  const statusSteps = [
    { 
      key: 'Pending', 
      icon: HiClock, 
      label: 'Pending', 
      description: 'Awaiting approval from backoffice',
      color: 'yellow'
    },
    { 
      key: 'Approved', 
      icon: HiCheckCircle, 
      label: 'Approved', 
      description: 'Booking confirmed by backoffice',
      color: 'blue'
    },
    { 
      key: 'Confirmed', 
      icon: HiCheckCircle, 
      label: 'Confirmed', 
      description: 'Station operator has verified arrival',
      color: 'green'
    },
    { 
      key: 'Completed', 
      icon: HiCheckCircle, 
      label: 'Completed', 
      description: 'Charging session finished successfully',
      color: 'indigo'
    },
    { 
      key: 'Canceled', 
      icon: HiXCircle, 
      label: 'Canceled', 
      description: 'Booking was canceled by user or admin',
      color: 'red'
    },
  ];

  const getStepStyle = (stepKey) => {
    const stepIndex = statusSteps.findIndex(s => s.key === stepKey);
    const currentIndex = statusSteps.findIndex(s => s.key === currentStatus);
    
    if (stepKey === currentStatus) {
      return {
        iconColor: `${stepKey.toLowerCase()}-600`,
        bgColor: `${stepKey.toLowerCase()}-100`,
        ringColor: `${stepKey.toLowerCase()}-300`,
        textColor: 'text-gray-700 font-semibold',
        lineColor: `${stepKey.toLowerCase()}-300`
      };
    } else if (stepIndex < currentIndex && currentStatus !== 'Canceled') {
      return {
        iconColor: 'text-green-500',
        bgColor: 'bg-green-100',
        ringColor: 'green-300',
        textColor: 'text-gray-600',
        lineColor: 'bg-green-300'
      };
    } else {
      return {
        iconColor: 'text-gray-400',
        bgColor: 'bg-gray-100',
        ringColor: 'gray-200',
        textColor: 'text-gray-500',
        lineColor: 'bg-gray-200'
      };
    }
  };

  // Action eligibility checks
  const canApprove = currentStatus === 'Pending';
  const canConfirm = currentStatus === 'Approved';
  const canComplete = currentStatus === 'Confirmed';
  const canCancel = ['Pending', 'Approved'].includes(currentStatus) && hoursUntilReservation >= 3;
  const canReopen = currentStatus === 'Canceled' && isFutureReservation;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Booking Details</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Enhanced Status Timeline */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-6 flex items-center">
              <HiCheckCircle className="h-5 w-5 text-indigo-500 mr-2" />
              Booking Journey
            </h4>
            <div className="relative">
              {/* Timeline Steps */}
              <div className="flex items-center justify-between relative">
                {statusSteps.map((step, index) => {
                  const style = getStepStyle(step.key);
                  const isCurrent = step.key === currentStatus;
                  const isCompleted = statusSteps.findIndex(s => s.key === currentStatus) > index && currentStatus !== 'Canceled';

                  return (
                    <div key={step.key} className="flex flex-col items-center relative flex-1">
                      {/* Step Circle */}
                      <div className={`relative p-3 rounded-full ring-2 ring-inset ${style.ringColor} bg-${style.bgColor} transition-all duration-300 ${isCurrent ? 'scale-110 shadow-lg' : ''}`}>
                        {isCompleted ? (
                          <HiCheckCircle className="h-5 w-5 text-green-500 absolute inset-0 m-auto" />
                        ) : (
                          <step.icon className={`h-5 w-5 ${style.iconColor}`} />
                        )}
                      </div>
                      
                      {/* Step Label */}
                      <div className={`text-center mt-3 px-2 ${style.textColor} transition-colors duration-300 ${isCurrent ? 'font-bold text-lg' : 'text-sm'}`}>
                        {step.label}
                      </div>
                      
                      {/* Step Description */}
                      <div className="text-xs text-gray-500 mt-1 text-center max-w-[100px] leading-tight">
                        {step.description}
                      </div>

                      {/* Connecting Line (except last step) */}
                      {index < statusSteps.length - 1 && (
                        <div className={`absolute top-12 left-1/2 transform -translate-x-1/2 w-full h-0.5 ${style.lineColor} z-0 transition-colors duration-300`} />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Current Status Highlight */}
              {currentStatus === 'Canceled' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-1 bg-red-300 rounded-full opacity-50" style={{ top: '3.5rem' }} />
                </div>
              )}
            </div>
            
            {/* Quick Status Pill */}
            <div className="mt-6 text-center">
              <StatusPill status={currentStatus} />
              <p className={`text-xs mt-2 ${hoursUntilReservation >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                {isFutureReservation ? `${hoursUntilReservation.toFixed(1)} hours until reservation` : 'Reservation time has passed'}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Booking ID</label>
                  <p className="text-lg font-mono text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-200">{booking.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">EV Owner ID</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-200">{booking.userId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Station ID</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-200">{booking.stationId}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Slot ID</label>
                  <p className="text-lg font-mono text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-200">{booking.slotId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reservation Date & Time</label>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-900 mb-1">{new Date(booking.reservationDateTime).toLocaleString()}</p>
                    <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      hoursUntilReservation >= 3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {hoursUntilReservation >= 3 ? `⏰ ${hoursUntilReservation.toFixed(1)} hours remaining` : '⚠️ Less than 3 hours remaining'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {booking.operatorUsername && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Operator Username</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-200">{booking.operatorUsername}</p>
              </div>
            )}

            {/* Action Eligibility - Enhanced with tooltips and better layout */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Action Availability
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Approve Booking', condition: canApprove, reason: 'Available only for Pending bookings' },
                  { label: 'Confirm Arrival', condition: canConfirm, reason: 'Available only for Approved bookings' },
                  { label: 'Mark as Complete', condition: canComplete, reason: 'Available only for Confirmed bookings' },
                  { 
                    label: 'Cancel Booking', 
                    condition: canCancel, 
                    reason: `Available for Pending/Approved with ≥3 hours remaining (${hoursUntilReservation.toFixed(1)} hrs left)` 
                  },
                  { 
                    label: 'Reopen Booking', 
                    condition: canReopen, 
                    reason: 'Available for Canceled future reservations only' 
                  }
                ].map(({ label, condition, reason }) => (
                  <div key={label} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-100">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{reason}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      condition 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {condition ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions in Modal (if needed, e.g., for backoffice) */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 bg-gray-50 px-6 pb-6">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;