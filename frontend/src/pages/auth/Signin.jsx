import React, { useState } from 'react';
import { loginUser } from '@/api/AuthApi';
import { useAuth } from '@/context/AuthContext'; // adjust path if different

const Signin = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg('');
    setLoading(true);
    try {
      const { token, Role, Username, UserId } = await loginUser({ username, password });
      login(token, { username: Username || username, role: Role, userId: UserId, remember });
      // 👉 TODO: navigate to dashboard if using react-router
    } catch (err) {
      setErrMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="webcrumbs">
      <div className="flex min-h-screen">
        {/* Left panel */}
        <div className="w-5/12 bg-indigo-800 text-white p-12 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">Reference site about Lorem Ipsum..</h1>
          <p className="text-sm leading-relaxed">
            What is Lorem Ipsum Lorem Ipsum is simply dummy text of the printing and typesetting industry…
          </p>
        </div>

        {/* Right panel */}
        <div className="w-7/12 flex flex-col justify-center relative overflow-hidden">
          <div className="ml-auto w-8/12 px-6">
            <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
            <p className="text-sm text-gray-600 mb-4">Please sign in to your account</p>

            {/* Social icons (optional) */}
            <div className="flex justify-center space-x-3 mb-2">
              <button type="button" className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors">
                <i className="fa-brands fa-facebook" />
              </button>
              <button type="button" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-300 transition-colors">
                <i className="fa-brands fa-twitter" />
              </button>
              <button type="button" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                <i className="fa-brands fa-linkedin" />
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="h-px bg-gray-200 flex-grow" />
              <span className="px-4 text-xs text-gray-400">or continue with</span>
              <div className="h-px bg-gray-200 flex-grow" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full border border-gray-200 rounded-md py-2 px-3"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <span className="material-symbols-outlined">person</span>
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="current-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 rounded-md py-2 px-3"
                  required
                />
              </div>

              {/* Remember + Forgot */}
              <div className="flex justify-between items-center">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <a href="#" className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors">
                  Forgot your password?
                </a>
              </div>

              {/* Error */}
              {errMsg && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {errMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white py-3 rounded-md transition-colors"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">Don't have an account?</p>
              <a href="#" className="text-indigo-500 hover:text-indigo-600 transition-colors text-sm">
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
