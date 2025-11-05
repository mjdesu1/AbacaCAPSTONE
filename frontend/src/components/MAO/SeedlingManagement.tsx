import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Package,
  Users,
  TrendingUp,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  Building2,
  MapPin
} from 'lucide-react';

interface Seedling {
  seedling_id: string;
  variety: string;
  source_supplier?: string;
  quantity_distributed: number;
  date_distributed: string;
  recipient_farmer_id?: string;
  recipient_association?: string;
  remarks?: string;
  status: string;
  distributed_by?: string;
  seedling_photo?: string;
  packaging_photo?: string;
  quality_photo?: string;
  planting_date?: string;
  planting_location?: string;
  planting_photo_1?: string;
  planting_photo_2?: string;
  planting_photo_3?: string;
  planting_notes?: string;
  planted_by?: string;
  planted_at?: string;
  created_at: string;
  farmers?: {
    farmer_id: string;
    full_name: string;
    email: string;
    association_name?: string;
  };
  association_officers?: {
    officer_id: string;
    full_name: string;
  };
}

interface SeedlingFormData {
  variety: string;
  source_supplier: string;
  quantity_distributed: number;
  date_distributed: string;
  recipient_farmer_id: string;
  recipient_association: string;
  remarks: string;
  status: string;
  seedling_photo?: string;
  packaging_photo?: string;
  quality_photo?: string;
}

const SeedlingManagement: React.FC = () => {
  const [seedlings, setSeedlings] = useState<Seedling[]>([]);
  const [filteredSeedlings, setFilteredSeedlings] = useState<Seedling[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSeedling, setSelectedSeedling] = useState<Seedling | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    totalQuantity: 0,
    thisMonth: 0,
    varieties: 0
  });

  const [formData, setFormData] = useState<SeedlingFormData>({
    variety: '',
    source_supplier: '',
    quantity_distributed: 0,
    date_distributed: new Date().toISOString().split('T')[0],
    recipient_farmer_id: '',
    recipient_association: '',
    remarks: '',
    status: 'distributed'
  });

  useEffect(() => {
    fetchSeedlings();
    fetchFarmers();
  }, []);

  useEffect(() => {
    filterSeedlings();
  }, [seedlings, searchTerm, statusFilter]);

  const fetchSeedlings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/seedlings/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setSeedlings(data);
        calculateStats(data);
      } else {
        console.error('Invalid data format:', data);
        setSeedlings([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Error fetching seedlings:', error);
      setSeedlings([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/mao/farmers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setFarmers(data);
      } else {
        console.error('Invalid farmers data format:', data);
        setFarmers([]);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
      setFarmers([]);
    }
  };

  const calculateStats = (data: Seedling[]) => {
    const total = data.length;
    const totalQuantity = data.reduce((sum, s) => sum + s.quantity_distributed, 0);
    const thisMonth = data.filter(s => {
      const date = new Date(s.date_distributed);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const varieties = new Set(data.map(s => s.variety)).size;

    setStats({ total, totalQuantity, thisMonth, varieties });
  };

  const filterSeedlings = () => {
    let filtered = seedlings;

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.source_supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.recipient_association?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.farmers?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    setFilteredSeedlings(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/seedlings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Seedling distribution recorded successfully!');
        setShowAddModal(false);
        resetForm();
        fetchSeedlings();
      }
    } catch (error) {
      console.error('Error creating seedling:', error);
      alert('Failed to record seedling distribution');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeedling) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/seedlings/${selectedSeedling.seedling_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Seedling updated successfully!');
        setShowEditModal(false);
        fetchSeedlings();
      }
    } catch (error) {
      console.error('Error updating seedling:', error);
      alert('Failed to update seedling');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this seedling record?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/seedlings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Seedling deleted successfully!');
        fetchSeedlings();
      }
    } catch (error) {
      console.error('Error deleting seedling:', error);
      alert('Failed to delete seedling');
    }
  };

  const resetForm = () => {
    setFormData({
      variety: '',
      source_supplier: '',
      quantity_distributed: 0,
      date_distributed: new Date().toISOString().split('T')[0],
      recipient_farmer_id: '',
      recipient_association: '',
      remarks: '',
      status: 'distributed',
      seedling_photo: undefined,
      packaging_photo: undefined,
      quality_photo: undefined
    });
  };

  const handleExportCSV = () => {
    if (filteredSeedlings.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Variety', 'Quantity', 'Source/Supplier', 'Recipient Farmer', 'Association', 'Status', 'Remarks'];
    
    const rows = filteredSeedlings.map(s => [
      new Date(s.date_distributed).toLocaleDateString(),
      s.variety,
      s.quantity_distributed,
      s.source_supplier || 'N/A',
      s.farmers?.full_name || 'N/A',
      s.recipient_association || s.farmers?.association_name || 'N/A',
      s.status,
      s.remarks || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `seedling_distribution_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, photoType: 'seedling' | 'packaging' | 'quality') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({
        ...formData,
        [`${photoType}_photo`]: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = (seedling: Seedling) => {
    setSelectedSeedling(seedling);
    setFormData({
      variety: seedling.variety,
      source_supplier: seedling.source_supplier || '',
      quantity_distributed: seedling.quantity_distributed,
      date_distributed: seedling.date_distributed,
      recipient_farmer_id: seedling.recipient_farmer_id || '',
      recipient_association: seedling.recipient_association || '',
      remarks: seedling.remarks || '',
      status: seedling.status,
      seedling_photo: seedling.seedling_photo,
      packaging_photo: seedling.packaging_photo,
      quality_photo: seedling.quality_photo
    });
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-50 p-8">
      {/* Modern Stats Cards with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="group relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-white/90 text-sm font-medium mb-1">Total Distributions</p>
            <p className="text-4xl font-bold text-white">{stats.total}</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-semibold">Total</span>
            </div>
            <p className="text-white/90 text-sm font-medium mb-1">Total Seedlings</p>
            <p className="text-4xl font-bold text-white">{stats.totalQuantity.toLocaleString()}</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-semibold">Recent</span>
            </div>
            <p className="text-white/90 text-sm font-medium mb-1">This Month</p>
            <p className="text-4xl font-bold text-white">{stats.thisMonth}</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-white/90 text-sm font-medium mb-1">Varieties</p>
            <p className="text-4xl font-bold text-white">{stats.varieties}</p>
          </div>
        </div>
      </div>

      {/* Modern Filters with Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by variety, supplier, farmer, association..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="w-full md:w-56">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 appearance-none cursor-pointer font-medium"
              >
                <option value="all">All Status</option>
                <option value="distributed">📦 Distributed</option>
                <option value="planted">🌱 Planted</option>
                <option value="damaged">⚠️ Damaged</option>
                <option value="replanted">🔄 Replanted</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold whitespace-nowrap group"
            title="Export to CSV"
          >
            <Download className="w-5 h-5 group-hover:animate-bounce" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Distribution
          </button>
        </div>
      </div>

      {/* Modern Table with Enhanced Design */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading seedlings...</p>
          </div>
        ) : filteredSeedlings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Sprout className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No seedling distributions found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Photo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4" />
                      Variety
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Recipient
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Source
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredSeedlings.map((seedling) => (
                  <tr key={seedling.seedling_id} className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {seedling.seedling_photo ? (
                          <img 
                            src={seedling.seedling_photo} 
                            alt="Seedling" 
                            className="w-full h-full object-cover"
                          />
                        ) : seedling.packaging_photo ? (
                          <img 
                            src={seedling.packaging_photo} 
                            alt="Packaging" 
                            className="w-full h-full object-cover"
                          />
                        ) : seedling.quality_photo ? (
                          <img 
                            src={seedling.quality_photo} 
                            alt="Quality" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Sprout className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(seedling.date_distributed).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{seedling.variety}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">{seedling.quantity_distributed.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {seedling.farmers ? (
                        <div>
                          <div className="font-medium text-gray-900">{seedling.farmers.full_name}</div>
                          <div className="text-gray-500 text-xs">{seedling.farmers.association_name}</div>
                        </div>
                      ) : (
                        <div className="text-gray-600">{seedling.recipient_association || 'N/A'}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {seedling.source_supplier || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        seedling.status === 'planted' ? 'bg-green-100 text-green-700' :
                        seedling.status === 'distributed' ? 'bg-blue-100 text-blue-700' :
                        seedling.status === 'damaged' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {seedling.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedSeedling(seedling);
                            setShowViewModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(seedling)}
                          className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(seedling.seedling_id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                {showAddModal ? 'Add Seedling Distribution' : 'Edit Seedling'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleSubmit : handleUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variety *</label>
                  <input
                    type="text"
                    required
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Musa Textilis, Tangongon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source/Supplier</label>
                  <input
                    type="text"
                    value={formData.source_supplier}
                    onChange={(e) => setFormData({ ...formData, source_supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., PhilFIDA Nursery"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity_distributed}
                    onChange={(e) => setFormData({ ...formData, quantity_distributed: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Number of seedlings"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Distributed *</label>
                  <input
                    type="date"
                    required
                    value={formData.date_distributed}
                    onChange={(e) => setFormData({ ...formData, date_distributed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Farmer</label>
                  <select
                    value={formData.recipient_farmer_id}
                    onChange={(e) => setFormData({ ...formData, recipient_farmer_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Farmer (Optional)</option>
                    {farmers.map((farmer) => (
                      <option key={farmer.id} value={farmer.id}>
                        {farmer.name} - {farmer.association || 'No Association'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Association</label>
                  <input
                    type="text"
                    value={formData.recipient_association}
                    onChange={(e) => setFormData({ ...formData, recipient_association: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., CuSAFA, SAAD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="distributed">Distributed</option>
                    <option value="planted">Planted</option>
                    <option value="damaged">Damaged</option>
                    <option value="replanted">Replanted</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    rows={3}
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Healthy seedlings, ready for planting"
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4">📸 Seedling Photos (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Seedling Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seedling Photo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition">
                      {formData.seedling_photo ? (
                        <div className="relative">
                          <img src={formData.seedling_photo} alt="Seedling" className="w-full h-32 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, seedling_photo: undefined })}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Sprout className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600">Click to upload</p>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, 'seedling')}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Packaging Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Packaging Photo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition">
                      {formData.packaging_photo ? (
                        <div className="relative">
                          <img src={formData.packaging_photo} alt="Packaging" className="w-full h-32 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, packaging_photo: undefined })}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600">Click to upload</p>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, 'packaging')}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Quality Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quality Check Photo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition">
                      {formData.quality_photo ? (
                        <div className="relative">
                          <img src={formData.quality_photo} alt="Quality" className="w-full h-32 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, quality_photo: undefined })}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600">Click to upload</p>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, 'quality')}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Max file size: 5MB per image</p>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {showAddModal ? 'Add Distribution' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedSeedling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Seedling Distribution Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Variety</p>
                  <p className="font-medium text-gray-900">{selectedSeedling.variety}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium text-gray-900">{selectedSeedling.quantity_distributed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date Distributed</p>
                  <p className="font-medium text-gray-900">{new Date(selectedSeedling.date_distributed).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Source/Supplier</p>
                  <p className="font-medium text-gray-900">{selectedSeedling.source_supplier || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recipient Farmer</p>
                  <p className="font-medium text-gray-900">{selectedSeedling.farmers?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recipient Association</p>
                  <p className="font-medium text-gray-900">{selectedSeedling.recipient_association || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedSeedling.status === 'planted' ? 'bg-green-100 text-green-700' :
                    selectedSeedling.status === 'distributed' ? 'bg-blue-100 text-blue-700' :
                    selectedSeedling.status === 'damaged' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedSeedling.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distributed By</p>
                  <p className="font-medium text-gray-900">{selectedSeedling.association_officers?.full_name || 'N/A'}</p>
                </div>
                {selectedSeedling.remarks && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Remarks</p>
                    <p className="font-medium text-gray-900">{selectedSeedling.remarks}</p>
                  </div>
                )}
              </div>

              {/* Planting Information */}
              {selectedSeedling.status === 'planted' && selectedSeedling.planting_date && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">🌱 Planting Information</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-700">Planting Date</p>
                        <p className="font-medium text-green-900">{new Date(selectedSeedling.planting_date).toLocaleDateString()}</p>
                      </div>
                      {selectedSeedling.planting_location && (
                        <div>
                          <p className="text-sm text-green-700">Location</p>
                          <p className="font-medium text-green-900">{selectedSeedling.planting_location}</p>
                        </div>
                      )}
                      {selectedSeedling.planted_at && (
                        <div>
                          <p className="text-sm text-green-700">Marked as Planted</p>
                          <p className="font-medium text-green-900">{new Date(selectedSeedling.planted_at).toLocaleDateString()}</p>
                        </div>
                      )}
                      {selectedSeedling.planting_notes && (
                        <div className="col-span-2">
                          <p className="text-sm text-green-700">Farmer's Notes</p>
                          <p className="font-medium text-green-900">{selectedSeedling.planting_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Distribution Photos Section */}
              {(selectedSeedling.seedling_photo || selectedSeedling.packaging_photo || selectedSeedling.quality_photo) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">📸 Distribution Photos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedSeedling.seedling_photo && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Seedling Photo</p>
                        <img 
                          src={selectedSeedling.seedling_photo} 
                          alt="Seedling" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    {selectedSeedling.packaging_photo && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Packaging Photo</p>
                        <img 
                          src={selectedSeedling.packaging_photo} 
                          alt="Packaging" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    {selectedSeedling.quality_photo && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Quality Check Photo</p>
                        <img 
                          src={selectedSeedling.quality_photo} 
                          alt="Quality" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Planting Photos Section */}
              {(selectedSeedling.planting_photo_1 || selectedSeedling.planting_photo_2 || selectedSeedling.planting_photo_3) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">🌱 Planting Photos (From Farmer)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedSeedling.planting_photo_1 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Planting Photo 1</p>
                        <img 
                          src={selectedSeedling.planting_photo_1} 
                          alt="Planting 1" 
                          className="w-full h-48 object-cover rounded-lg border border-green-200"
                        />
                      </div>
                    )}
                    {selectedSeedling.planting_photo_2 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Planting Photo 2</p>
                        <img 
                          src={selectedSeedling.planting_photo_2} 
                          alt="Planting 2" 
                          className="w-full h-48 object-cover rounded-lg border border-green-200"
                        />
                      </div>
                    )}
                    {selectedSeedling.planting_photo_3 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Planting Photo 3</p>
                        <img 
                          src={selectedSeedling.planting_photo_3} 
                          alt="Planting 3" 
                          className="w-full h-48 object-cover rounded-lg border border-green-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeedlingManagement;
