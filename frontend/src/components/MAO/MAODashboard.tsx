import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  CheckCircle, 
  XCircle,
  LogOut,
  Menu,
  X,
  UserCheck,
  TrendingUp,
  BarChart3,
  Wrench,
  Sprout,
  User,
  Settings,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Shield,
  Camera,
  Calendar,
  Eye,
  BookOpen,
  FileText
} from 'lucide-react';
import UserManagement from './UserManagement';
import OfficerManagement from './OfficerManagement';
import MaintenanceToggle from './MaintenanceToggle';
import SeedlingManagement from './SeedlingManagement';
import PlantingMonitor from './PlantingMonitor';
import MonitoringPage from '../../pages/MonitoringPage';
import ArticleManagement from './ArticleManagement';
import TeamManagement from './TeamManagement';

interface MAODashboardProps {
  onLogout: () => void;
}

const MAODashboard: React.FC<MAODashboardProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'farmers' | 'buyers'>('farmers');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'users' | 'officers' | 'maintenance' | 'seedlings' | 'planting' | 'monitoring' | 'content'>('dashboard');
  const [contentTab, setContentTab] = useState<'articles' | 'team'>('articles');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [officerData, setOfficerData] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({
    email: '',
    contact_number: '',
    address: '',
    position: '',
    association_name: '',
    full_name: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isSuperAdmin = user?.isSuperAdmin === true;
  
  // Debug: Log user info
  console.log('🔍 MAO Dashboard - User Info:', {
    email: user?.email,
    isSuperAdmin: user?.isSuperAdmin,
    fullName: user?.fullName,
    position: user?.position
  });

  // Fetch officer profile data
  const fetchOfficerProfile = async () => {
    setLoadingProfile(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile data loaded:', data);
        console.log('📧 Email:', data.email);
        console.log('📞 Contact:', data.contact_number);
        console.log('📍 Address:', data.address);
        console.log('💼 Position:', data.position);
        console.log('🏢 Association:', data.association_name);
        
        // Ensure all fields are properly set
        const officerInfo = {
          ...data,
          email: data.email || user?.email || '',
          contact_number: data.contact_number || '',
          address: data.address || '',
          position: data.position || user?.position || '',
          association_name: data.association_name || '',
          full_name: data.full_name || user?.fullName || ''
        };
        
        console.log('🔍 Officer data being set:', officerInfo);
        setOfficerData(officerInfo);
        
        // Set form data with proper fallbacks
        const formData = {
          email: data.email || user?.email || '',
          contact_number: data.contact_number || '',
          address: data.address || '',
          position: data.position || user?.position || '',
          association_name: data.association_name || '',
          full_name: data.full_name || user?.fullName || ''
        };
        console.log('📝 Setting form data:', formData);
        setEditFormData(formData);
        setProfilePhoto(data.profile_picture || null);
      } else {
        console.error('❌ Failed to fetch profile, status:', response.status);
        const errorData = await response.json();
        console.error('❌ Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      console.log('💾 Saving profile data:', {
        position: editFormData.position,
        associationName: editFormData.association_name,
        contactNumber: editFormData.contact_number,
        address: editFormData.address,
        profilePicture: profilePhoto
      });
      
      const response = await fetch(`http://localhost:3001/api/mao/complete-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position: editFormData.position || '',
          associationName: editFormData.association_name || '',
          contactNumber: editFormData.contact_number || '',
          address: editFormData.address || '',
          termStartDate: null,
          termEndDate: null,
          farmersUnderSupervision: 0,
          profilePicture: profilePhoto || null,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Profile saved:', result);
        setOfficerData(result.officer);
        setIsEditMode(false);
        alert('✅ Profile updated successfully!');
        // Refresh profile data to update everywhere including header
        await fetchOfficerProfile();
      } else {
        const errorData = await response.json();
        console.error('❌ Save failed:', errorData);
        alert('❌ Failed to update profile: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Error saving profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setProfilePhoto(base64String);
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:3001/api/mao/complete-profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            profilePicture: base64String,
            position: editFormData.position || user?.position,
            associationName: editFormData.association_name,
            contactNumber: editFormData.contact_number,
            address: editFormData.address,
          }),
        });

        if (response.ok) {
          alert('✅ Profile picture updated!');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('❌ Error uploading photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Load profile photo on component mount
  useEffect(() => {
    fetchOfficerProfile();
  }, []);

  useEffect(() => {
    if (showProfileModal) {
      fetchOfficerProfile();
    } else {
      // Reset states when modal closes (but keep profilePhoto)
      setIsEditMode(false);
      setOfficerData(null);
      setEditFormData({});
    }
  }, [showProfileModal]);

  // Mock data - replace with real API calls
  const pendingFarmers = [
    { id: 1, name: 'Juan Dela Cruz', association: 'CuSAFA', municipality: 'Prosperidad', date: '2025-10-30' },
    { id: 2, name: 'Maria Santos', association: 'ABACA Farmers', municipality: 'Culiram', date: '2025-10-29' },
    { id: 3, name: 'Pedro Reyes', association: 'CuSAFA', municipality: 'Prosperidad', date: '2025-10-28' },
  ];

  const pendingBuyers = [
    { id: 1, name: 'ABC Trading Corp', owner: 'John Smith', license: 'PHF-2024-001', date: '2025-10-30' },
    { id: 2, name: 'XYZ Exports Inc', owner: 'Jane Doe', license: 'PHF-2024-002', date: '2025-10-29' },
  ];

  const stats = [
    { label: 'Total Farmers', value: '2,400', icon: Users, color: 'bg-blue-500', change: '+12%' },
    { label: 'Total Buyers', value: '220', icon: ShoppingCart, color: 'bg-emerald-500', change: '+8%' },
    { label: 'Pending Verification', value: '15', icon: UserCheck, color: 'bg-amber-500', change: '-5%' },
    { label: 'Active Associations', value: '8', icon: TrendingUp, color: 'bg-purple-500', change: '+2' },
  ];

  const handleApprove = (id: number, type: 'farmer' | 'buyer') => {
    console.log(`Approving ${type} with id:`, id);
    // TODO: API call to approve
  };

  const handleReject = (id: number, type: 'farmer' | 'buyer') => {
    console.log(`Rejecting ${type} with id:`, id);
    // TODO: API call to reject
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>
            <h1 className="text-xl font-bold whitespace-nowrap">MAO Culiram</h1>
            <p className="text-xs text-slate-400 whitespace-nowrap">
              {isSuperAdmin ? '⭐ Super Admin Panel' : 'Officer Panel'}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all duration-200 flex-shrink-0"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'dashboard' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Dashboard</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'users' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <UserCheck className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>User Management</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('seedlings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'seedlings' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <Sprout className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Seedling Distribution</span>
          </button>

          <button 
            onClick={() => setCurrentPage('planting')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'planting' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Planted</span>
          </button>

          <button 
            onClick={() => setCurrentPage('monitoring')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'monitoring' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Field Monitoring</span>
          </button>
          
          {/* Content Management - Only for Super Admin */}
          {isSuperAdmin && (
            <button 
              onClick={() => setCurrentPage('content')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentPage === 'content' ? 'bg-emerald-600' : 'hover:bg-slate-700'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Content Management</span>
            </button>
          )}
          
          {/* Officer Management - Only for Super Admin */}
          {isSuperAdmin && (
            <button 
              onClick={() => setCurrentPage('officers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentPage === 'officers' ? 'bg-emerald-600' : 'hover:bg-slate-700'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Officer Management</span>
            </button>
          )}
          
          <button className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition-all duration-200 ${!sidebarOpen && 'justify-center'}`}>
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Reports</span>
          </button>
          
          {/* Maintenance Mode - Only for Super Admin */}
          {isSuperAdmin && (
            <button 
              onClick={() => setCurrentPage('maintenance')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentPage === 'maintenance' ? 'bg-amber-600' : 'hover:bg-slate-700'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <Wrench className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Maintenance</span>
            </button>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 rounded-lg transition-all duration-200 ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header - Always visible on all pages */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {currentPage === 'dashboard' ? 'Dashboard' :
                 currentPage === 'users' ? 'User Management' :
                 currentPage === 'seedlings' ? 'Seedling Distribution' :
                 currentPage === 'planting' ? 'Planting Monitor' :
                 currentPage === 'monitoring' ? 'Field Monitoring' :
                 currentPage === 'officers' ? 'Officer Management' :
                 currentPage === 'maintenance' ? 'Maintenance Mode' :
                 currentPage === 'content' ? 'Content Management' :
                 'Dashboard'}
              </h2>
              <p className="text-gray-600">
                Welcome back, {isSuperAdmin ? 'Super Admin' : 'Officer'}
              </p>
            </div>
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 transition-all duration-200"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.fullName || 'Officer'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isSuperAdmin ? (
                      <span className="text-amber-600 font-semibold">⭐ Super Admin</span>
                    ) : (
                      'MAO Officer'
                    )}
                  </p>
                </div>
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-lg"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setShowProfileModal(true);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3 text-gray-700"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(true);
                      setShowProfileModal(true);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3 text-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {currentPage === 'users' ? (
          <UserManagement />
        ) : currentPage === 'seedlings' ? (
          <SeedlingManagement />
        ) : currentPage === 'planting' ? (
          <PlantingMonitor />
        ) : currentPage === 'monitoring' ? (
          <MonitoringPage />
        ) : currentPage === 'officers' ? (
          <OfficerManagement />
        ) : currentPage === 'maintenance' ? (
          <MaintenanceToggle />
        ) : currentPage === 'content' ? (
          /* Content Management with Tabs */
          <div className="bg-gray-50 min-h-screen">
            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setContentTab('articles')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                    contentTab === 'articles'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  Articles & News
                </button>
                <button
                  onClick={() => setContentTab('team')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                    contentTab === 'team'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Team Members
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {contentTab === 'articles' ? <ArticleManagement /> : <TeamManagement />}
          </div>
        ) : (
          /* Dashboard Content */
          <div className="p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Verification Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Pending Verifications</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('farmers')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === 'farmers'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Farmers ({pendingFarmers.length})
                </button>
                <button
                  onClick={() => setActiveTab('buyers')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === 'buyers'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Buyers ({pendingBuyers.length})
                </button>
              </div>
            </div>

            {/* Farmers Table */}
            {activeTab === 'farmers' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Association</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Municipality</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingFarmers.map((farmer) => (
                      <tr key={farmer.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-800">{farmer.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{farmer.association}</td>
                        <td className="py-4 px-4 text-gray-600">{farmer.municipality}</td>
                        <td className="py-4 px-4 text-gray-600">{farmer.date}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(farmer.id, 'farmer')}
                              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(farmer.id, 'farmer')}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Buyers Table */}
            {activeTab === 'buyers' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Business Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">License</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBuyers.map((buyer) => (
                      <tr key={buyer.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="font-medium text-gray-800">{buyer.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{buyer.owner}</td>
                        <td className="py-4 px-4 text-gray-600">{buyer.license}</td>
                        <td className="py-4 px-4 text-gray-600">{buyer.date}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(buyer.id, 'buyer')}
                              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(buyer.id, 'buyer')}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </div>
        )}
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header - Project Theme Colors */}
            <div className="p-6 bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl shadow-lg border-b-4 border-emerald-500">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Profile' : 'My Profile'}</h2>
                  <p className="text-emerald-100 text-sm">{isEditMode ? 'Update your information' : 'View your details'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all duration-200 flex items-center gap-2 text-white font-medium border border-white/30"
                >
                  {isEditMode ? (
                    <>
                      <Eye className="w-4 h-4" />
                      View Mode
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Edit Mode
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setIsEditMode(false);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {loadingProfile ? (
              <div className="p-12 text-center">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600">Loading profile...</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Profile Header - Modern Design */}
                <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50 rounded-2xl p-8 mb-6 relative overflow-hidden border-2 border-gray-200 shadow-lg">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-500/5 rounded-full -ml-24 -mb-24"></div>
                  <div className="relative flex items-center gap-6">
                    <div className="relative group">
                      {profilePhoto ? (
                        <img 
                          src={profilePhoto} 
                          alt="Profile" 
                          className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
                        />
                      ) : (
                        <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white shadow-xl text-white">
                          {user?.fullName?.charAt(0) || 'A'}
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 rounded-full shadow-lg hover:bg-emerald-700 transition cursor-pointer group-hover:scale-110">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                        {uploadingPhoto ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Camera className="w-4 h-4 text-white" />
                        )}
                      </label>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-800">{officerData?.full_name || user?.fullName}</h3>
                      <p className="text-gray-600 font-semibold text-lg mt-1">{officerData?.position || user?.position}</p>
                      {isSuperAdmin && (
                        <span className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-xs font-bold border-2 border-amber-300 shadow-md text-white">
                          <Shield className="w-4 h-4" />
                          SUPER ADMINISTRATOR
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:border-emerald-400">
                    <h4 className="font-bold text-gray-800 mb-5 flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                      <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg">Contact Information</span>
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Email Address</label>
                        {isEditMode ? (
                          <input
                            type="email"
                            value={editFormData?.email || ''}
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-800 transition-all"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{officerData?.email || user?.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Contact Number</label>
                        {isEditMode ? (
                          <input
                            type="tel"
                            value={editFormData?.contact_number || ''}
                            onChange={(e) => setEditFormData({...editFormData, contact_number: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-800 transition-all"
                            placeholder="Enter contact number"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{officerData?.contact_number || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Address</label>
                        {isEditMode ? (
                          <textarea
                            value={editFormData?.address || ''}
                            onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-800 resize-none transition-all"
                            rows={2}
                            placeholder="Enter address"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{officerData?.address || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Work Information */}
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:border-emerald-400">
                    <h4 className="font-bold text-gray-800 mb-5 flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                      <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg">Work Information</span>
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Position</label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={editFormData?.position || ''}
                            onChange={(e) => setEditFormData({...editFormData, position: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-800 transition-all"
                            placeholder="Enter position"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{officerData?.position || user?.position}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Association</label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={editFormData?.association_name || ''}
                            onChange={(e) => setEditFormData({...editFormData, association_name: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-800 transition-all"
                            placeholder="Enter association"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{officerData?.association_name || 'MAO Culiram'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Term Information */}
                  {officerData?.term_start_date && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Term Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-purple-700 mb-1">Term Start Date</p>
                          <p className="font-medium text-purple-900">{new Date(officerData.term_start_date).toLocaleDateString()}</p>
                        </div>
                        {officerData.term_end_date && (
                          <div>
                            <p className="text-xs text-purple-700 mb-1">Term End Date</p>
                            <p className="font-medium text-purple-900">{new Date(officerData.term_end_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-purple-700 mb-1">Term Duration</p>
                          <p className="font-medium text-purple-900">{officerData.term_duration || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Status */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Account Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-700">Profile Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          officerData?.profile_completed 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {officerData?.profile_completed ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-700">Account Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          officerData?.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {officerData?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {officerData?.last_login && (
                        <div>
                          <p className="text-xs text-gray-700 mb-1">Last Login</p>
                          <p className="font-medium text-gray-900">{new Date(officerData.last_login).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      setIsEditMode(false);
                    }}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Close
                  </button>
                  {isEditMode && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEditFormData(officerData);
                          setIsEditMode(false);
                        }}
                        className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {savingProfile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MAODashboard;
