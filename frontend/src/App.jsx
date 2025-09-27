// src/App.jsx (UPDATED)

import { Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage'; 
import LoginPage from './pages/LoginPage';
// You'll need to create these dummy pages for testing the routing
const HomePage = () => <h1 className="text-3xl p-8">Welcome Home!</h1>;
// const LoginPage = () => <h1 className="text-3xl p-8">Login Page Placeholder</h1>;

function App() {
  return (
    <>
      {/* Simple Navigation for demonstration */}
      <nav className="p-4 bg-gray-800 text-white flex space-x-4">
        <Link to="/" className="hover:text-indigo-400">Home</Link>
        <Link to="/login" className="hover:text-indigo-400">Login</Link>
        <Link to="/register" className="hover:text-indigo-400">Register</Link>
      </nav>

      {/* Define application routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* The Register Page */}
        <Route path="/register" element={<RegisterPage />} />
        {/* Placeholder for Login Page (as per your backend structure) */}
        <Route path="/login" element={<LoginPage />} />
        {/* Fallback route for 404 */}
        <Route path="*" element={<h1 className="text-red-500 p-8">404 Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;