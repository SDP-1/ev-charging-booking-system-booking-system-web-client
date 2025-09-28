/**
 * Defines the structure for a Booking object returned from the API.
 */
export const BookingModel = {
    id: '',                      // MongoDB ObjectId as string
    userId: '',                  // EVOwner ID
    stationId: '',               // Charging station ID
    reservationDateTime: '',     // DateTime string
    approved: false,             // Approved by backoffice
    confirmed: false,            // Confirmed by station operator
    completed: false,            // Operation finalized
    createdAt: '',
    updatedAt: null,
    canceled: false,
};