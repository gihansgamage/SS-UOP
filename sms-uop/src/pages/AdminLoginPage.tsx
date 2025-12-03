// ... Keep imports ...
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'; // Ensure axios is imported

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, isAuthenticated, loading, checkAuthStatus } = useAuth();

  // New State for Test Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin');
    }
    checkAuthStatus();
  }, [isAuthenticated, loading, navigate, checkAuthStatus]);

  // Handle Form Login
  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      // Must use form-data or x-www-form-urlencoded for Spring Security Default Form Login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      await axios.post('http://localhost:8080/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true
      });

      // Refresh auth status and redirect
      await checkAuthStatus();
      navigate('/admin');
    } catch (err) {
      setLoginError('Invalid credentials');
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              University Admin Portal
            </h2>
          </div>

          <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">

            {/* --- TEST USER LOGIN FORM --- */}
            <form onSubmit={handleTestLogin} className="space-y-4 mb-6 border-b border-gray-200 pb-6">
              <h3 className="text-center text-sm font-semibold text-gray-500">Test User Login</h3>
              {loginError && <p className="text-red-500 text-xs text-center">{loginError}</p>}
              <div>
                <input
                    type="email"
                    placeholder="Email (e.g., test_ar@sms.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                />
              </div>
              <div>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                />
              </div>
              <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none"
              >
                Login as Test User
              </button>
            </form>
            {/* --------------------------- */}

            <div className="space-y-6">
              {error === 'auth_failed' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Authentication Failed.</strong>
                  </div>
              )}

              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Or sign in using your authorized Google account
                </p>
              </div>

              <button
                  onClick={loginWithGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border-gray-300 transition-all"
              >
                {/* Google Icon SVG */}
                <span className="ml-2">Sign in with Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminLoginPage;