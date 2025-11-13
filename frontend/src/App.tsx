import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { HomePage } from './pages';
import { FarmerAuth, BuyerAuth, CUSAFAAuth } from './Auth';
import OfficerLoginPage from './pages/OfficerLoginPage';
import MAOComponent from './components/MAO/MAOComponent';
import FarmersComponent from './components/Farmers/FarmersComponent';
import MaintenanceChecker from './components/MaintenanceChecker';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredUserType?: string }> = ({ 
  children, 
  requiredUserType 
}) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userType, setUserType] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    const type = localStorage.getItem('userType');
    
    if (token && user && type) {
      setIsAuthenticated(true);
      setUserType(type);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to homepage for farmers/buyers, MAO login for others
    const redirectPath = userType === 'farmer' || userType === 'buyer' ? '/' : '/mao';
    return <Navigate to={redirectPath} replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    // Redirect to homepage for farmers/buyers, MAO login for others
    const redirectPath = userType === 'farmer' || userType === 'buyer' ? '/' : '/mao';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const [userType, setUserType] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    const type = localStorage.getItem('userType');
    
    console.log('Dashboard - Token:', !!token, 'User:', !!user, 'Type:', type);
    
    if (token && user && type) {
      setUserType(type);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // Get user type before clearing localStorage
    const currentUserType = localStorage.getItem('userType');
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    
    // Redirect based on user type
    if (currentUserType === 'farmer' || currentUserType === 'buyer') {
      navigate('/'); // Redirect farmers and buyers to homepage
    } else {
      navigate('/mao'); // Redirect officers to MAO login
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (userType === 'officer') {
    return <MAOComponent />;
  }

  if (userType === 'farmer') {
    return <FarmersComponent onLogout={handleLogout} />;
  }

  if (userType === 'buyer') {
    return (
      <div>
        <nav className="bg-white shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-700">MAO Culiram Abaca System</h1>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </nav>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Welcome Buyer!</h2>
          <p className="text-gray-600">Buyer dashboard coming soon...</p>
        </div>
      </div>
    );
  }

  // If no valid userType found, redirect to home
  console.log('Dashboard - No valid userType found, redirecting to home. UserType:', userType);
  return <Navigate to="/" replace />;
};

// Main App Component
const AppContent: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = (role: string) => {
    if (role === 'farmer') {
      navigate('/farmer-login');
    } else if (role === 'buyer') {
      navigate('/buyer-login');
    } else if (role === 'cusafa') {
      navigate('/cusafa-login');
    }
  };

  const handleLoginSuccess = () => {
    console.log('Login success - navigating to dashboard');
    navigate('/dashboard');
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={<HomePage onLoginClick={handleLoginClick} />} 
      />
      
      {/* Authentication Routes */}
      <Route 
        path="/farmer-login" 
        element={
          <FarmerAuth 
            onBack={() => navigate('/')} 
            onLoginSuccess={handleLoginSuccess} 
          />
        } 
      />
      
      <Route 
        path="/buyer-login" 
        element={
          <BuyerAuth 
            onBack={() => navigate('/')} 
            onLoginSuccess={handleLoginSuccess} 
          />
        } 
      />
      
      <Route 
        path="/cusafa-login" 
        element={
          <CUSAFAAuth 
            onBack={() => navigate('/')} 
            onLoginSuccess={handleLoginSuccess} 
          />
        } 
      />

      {/* Secure Officer Login Route - Not exposed on homepage */}
      <Route 
        path="/mao" 
        element={<OfficerLoginPage onLoginSuccess={handleLoginSuccess} />} 
      />

      {/* Protected Dashboard Route */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <MaintenanceChecker>
        <Router>
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </MaintenanceChecker>
    </GoogleReCaptchaProvider>
  );
};

export default App;