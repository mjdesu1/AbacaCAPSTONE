import React from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { HomePage } from './pages';
import { FarmerAuth, BuyerAuth, OfficerAuth } from './Auth';
import MAOComponent from './components/MAO/MAOComponent';
import FarmersComponent from './components/Farmers/FarmersComponent';
import MaintenanceChecker from './components/MaintenanceChecker';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

type UserRole = 'farmer' | 'buyer' | 'officer';
type PageType = 'home' | 'farmerAuth' | 'buyerAuth' | 'officerAuth';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<PageType>('home');
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userType, setUserType] = React.useState<string>('');
  const [showAuthenticatedView, setShowAuthenticatedView] = React.useState(false);

  // Check if user is logged in
  React.useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    const type = localStorage.getItem('userType');
    
    if (token && user && type) {
      setIsAuthenticated(true);
      setUserType(type);
      
      // Check if we should show authenticated view (e.g., after maintenance login)
      const shouldShowAuth = sessionStorage.getItem('showAuthenticatedView');
      if (shouldShowAuth === 'true') {
        setShowAuthenticatedView(true);
        sessionStorage.removeItem('showAuthenticatedView'); // Clear the flag
      }
    } else {
      // Clear any stale data
      setIsAuthenticated(false);
      setUserType('');
    }
  }, []);

  const handleLoginClick = (role: UserRole) => {
    if (role === 'farmer') {
      setCurrentPage('farmerAuth');
    } else if (role === 'buyer') {
      setCurrentPage('buyerAuth');
    } else if (role === 'officer') {
      setCurrentPage('officerAuth');
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setShowAuthenticatedView(false);
  };

  const handleLoginSuccess = (userType: string) => {
    setIsAuthenticated(true);
    setUserType(userType);
    setShowAuthenticatedView(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setShowAuthenticatedView(false);
    setUserType('');
    setCurrentPage('home');
  };
  
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <MaintenanceChecker>
        <div className="App">
          <main>
            {currentPage === 'home' && !showAuthenticatedView && (
              <HomePage onLoginClick={handleLoginClick} />
            )}
          
          {currentPage === 'farmerAuth' && !showAuthenticatedView && (
            <FarmerAuth onBack={handleBackToHome} onLoginSuccess={() => handleLoginSuccess('farmer')} />
          )}

          {currentPage === 'buyerAuth' && !showAuthenticatedView && (
            <BuyerAuth onBack={handleBackToHome} onLoginSuccess={() => handleLoginSuccess('buyer')} />
          )}

          {currentPage === 'officerAuth' && !showAuthenticatedView && (
            <OfficerAuth onBack={handleBackToHome} onLoginSuccess={() => handleLoginSuccess('officer')} />
          )}

          {isAuthenticated && showAuthenticatedView && (
            <div>
              {/* Show MAO Dashboard for officers */}
              {userType === 'officer' && <MAOComponent />}
              
              {/* Show Farmer Dashboard */}
              {userType === 'farmer' && <FarmersComponent onLogout={handleLogout} />}
              
              {/* Show Buyer Dashboard */}
              {userType === 'buyer' && (
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
              )}
            </div>
          )}
        </main>
      </div>
      </MaintenanceChecker>
    </GoogleReCaptchaProvider>
  );
};

export default App;