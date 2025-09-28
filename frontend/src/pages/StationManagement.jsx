// (Backoffice only)
import DashboardLayout from '../components/DashboardLayout';

const StationManagement = () => (
    <>
        <h2 className="text-3xl font-semibold mb-6">Charging Station Management (Backoffice)</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Station Details & Slot Management</h3>
            <p className="text-gray-600">[Form/Table component for Station CRUD (Location, Type, Slots). Need to handle 'active bookings' check before deactivating.]</p>
        </div>
    </>
);
export default StationManagement;