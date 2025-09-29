import React, { useState } from 'react';
import useTheme from '../hooks/useTheme'; // Corrected: Removed curly braces for default import

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    section: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { theme, setTheme } = useTheme(); // Corrected: Renamed changeTheme to setTheme
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password || !credentials.section) {
      // Using a custom modal/toast instead of alert is better, but this works for now.
      console.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    const result = await onLogin(credentials);
    
    if (!result.success) {
      console.error(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: 'fas fa-sun' },
    { value: 'dark', label: 'Dark', icon: 'fas fa-moon' },
    { value: 'system', label: 'System', icon: 'fas fa-desktop' }
  ];

  const getThemeIcon = () => {
    const current = themeOptions.find(opt => opt.value === theme);
    return current?.icon || 'fas fa-sun';
  };

  return (
    <div className="min-h-screen login-bg bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/logo/indian-railways-seeklogo.png" 
            alt="Indian Railways Logo" 
            className="h-20 w-20 mx-auto mb-4 rounded-full shadow-lg" 
          />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">BharatRailNet</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Indian Railways Decision Support System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employee ID / Username
              </label>
              <div className="relative">
                <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your Employee ID"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Section */}
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Section Control
              </label>
              <select
                name="section"
                id="section"
                required
                value={credentials.section}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select your section</option>
                <option value="GZB">Ghaziabad (GZB)</option>
                <option value="NDLS">New Delhi (NDLS)</option>
                <option value="TDL">Tundla (TDL)</option>
                <option value="AGC">Agra Cantt (AGC)</option>
              </select>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="loader border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin mr-2"></div>
                Signing In...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Demo Credentials</p>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            <strong>ID:</strong> SK001 | <strong>Password:</strong> demo123 | <strong>Section:</strong> GZB
          </p>
        </div>

        {/* Theme Selector */}
        <div className="mt-6 flex justify-center">
          <div className="theme-selector relative">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
              title="Change Theme"
            >
              <i className={`${getThemeIcon()} mr-1`}></i>
              Theme
            </button>
            
            {showThemeDropdown && (
              <div className="theme-dropdown absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[150px]">
                {themeOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTheme(option.value); // Corrected: use setTheme
                      setShowThemeDropdown(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ${
                      index === 0 ? 'rounded-t-lg' : ''
                    } ${
                      index === themeOptions.length - 1 ? 'rounded-b-lg' : ''
                    } ${
                      theme === option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    <i className={`${option.icon} mr-2 w-4`}></i>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
