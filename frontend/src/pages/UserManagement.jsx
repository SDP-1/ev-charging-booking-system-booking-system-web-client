// (Backoffice only)
import DashboardLayout from '../components/DashboardLayout';

const UserManagement = () => (
    <>
        <h2 className="text-3xl font-semibold mb-6">User Management (Backoffice)</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">EV Owner Profiles (Create, Update, Activate/Deactivate)</h3>
            <p className="text-gray-600">[Table/Form component for EV Owner CRUD operations based on NIC]</p>
            <p className="mt-4 text-sm text-red-500">Only Backoffice users should see this page.</p>
        </div>
    </>
);
export default UserManagement;